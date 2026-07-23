import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  BasicCareNeed,
  CareUrgency,
  DisclosePreference,
  EthnicBackground,
  HomeAccessibility,
  LivingSituation,
  PreferredCaregiverGender,
  Prisma,
  ScheduleVibe,
  SpokenLanguage,
} from '../../generated/prisma/client.js';
import { getSupabaseAdminClient } from '../auth/supabase-admin';
import { UsersService } from '../users/users.service';
import { SeekerRepository } from './seeker.repository';
import {
  ensureObject,
  lowerCaseEnum,
  readOptionalString,
} from './seeker.validation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BASIC_CARE_NEEDS = new Set<string>(Object.values(BasicCareNeed));
const ETHNIC_BACKGROUNDS = new Set<string>(Object.values(EthnicBackground));
const SPOKEN_LANGUAGES = new Set<string>(Object.values(SpokenLanguage));
const LIVING_SITUATIONS = new Set<string>(Object.values(LivingSituation));
const PREFERRED_CAREGIVER_GENDERS = new Set<string>(
  Object.values(PreferredCaregiverGender),
);
const SCHEDULE_VIBES = new Set<string>(Object.values(ScheduleVibe));
const HOME_ACCESSIBILITIES = new Set<string>(Object.values(HomeAccessibility));
const CARE_URGENCIES = new Set<string>(Object.values(CareUrgency));

type RegisterSeekerPayload = {
  email: string;
  password: string;
  name: string;
  surname: string;
};

type UpdateSeekersInfoPayload =
  | {
      section: 'about_you';
      age: number;
      ethnicBackground: EthnicBackground;
      location: string;
      languagesSpoken: SpokenLanguage[];
      livingSituation: LivingSituation;
      needsHelpBesidesHousehold: boolean | null;
      preferredCaregiverGender: PreferredCaregiverGender;
      preferredCaregiverLanguage: SpokenLanguage;
      culturalConsiderationsPreference: DisclosePreference | null;
      culturalConsiderationsNotes: string | null;
      scheduleVibe: ScheduleVibe;
      homeAccessibility: HomeAccessibility[];
      careUrgency: CareUrgency;
    }
  | {
      section: 'care_health';
      needsMedicalHelp: boolean;
      healthDisclosePreference: DisclosePreference | null;
      healthNotes: string | null;
      medicationsDisclosePreference: DisclosePreference | null;
      medicationsNotes: string | null;
      basicCareNeeds: BasicCareNeed[];
      otherCareNeedDetails: string | null;
    };

@Injectable()
export class SeekerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly seekerRepository: SeekerRepository,
  ) {}

  async register(rawPayload: unknown) {
    const payload = this.validateRegisterPayload(rawPayload);
    const supabaseAdmin = getSupabaseAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes('already') ||
        error.message.toLowerCase().includes('exists')
      ) {
        throw new ConflictException({
          code: 'DUPLICATE_EMAIL',
          message: 'This email has already been registered',
        });
      }

      throw new BadRequestException({
        code: 'AUTH_SIGNUP_FAILED',
        message: error.message,
      });
    }

    const authUser = data.user;

    if (!authUser?.id || !authUser.email) {
      throw new InternalServerErrorException({
        code: 'AUTH_USER_CREATION_FAILED',
        message: 'Supabase did not return a valid user record.',
      });
    }

    try {
      const appUser = await this.usersService.createSeekerUser(
        authUser.id,
        authUser.email,
        {
          name: payload.name,
          surname: payload.surname,
        },
      );

      return {
        id: appUser.id,
        email: appUser.email,
        name: appUser.name,
        surname: appUser.surname,
        role: appUser.role.toLowerCase(),
      };
    } catch (error: unknown) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          code: 'DUPLICATE_USER',
          message: 'This user already exists.',
        });
      }

      throw error;
    }
  }

  async getOverview(userId: string) {
    const overview = await this.seekerRepository.getOverview(userId);
    const recentActivity = [
      ...overview.recentJobs.map((job) => ({
        id: job.id,
        type: 'job',
        label: job.title,
        status: lowerCaseEnum(job.status),
        createdAt: job.updatedAt,
      })),
      ...overview.recentNotifications.map((notification) => ({
        id: notification.id,
        type: 'notification',
        label: notification.title,
        status: lowerCaseEnum(notification.type),
        createdAt: notification.createdAt,
      })),
      ...overview.recentMessages.map((message) => ({
        id: message.id,
        type: 'message',
        label: message.body.slice(0, 80),
        status: 'received',
        createdAt: message.createdAt,
      })),
      ...overview.recentPayments.map((payment) => ({
        id: payment.id,
        type: 'payment',
        label: `${payment.amountCents} cents`,
        status: lowerCaseEnum(payment.status),
        createdAt: payment.createdAt,
      })),
    ]
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 10);

    return {
      activeJobs: overview.activeJobs,
      savedProvidersCount: overview.savedProvidersCount,
      notificationsCount: overview.notificationsCount,
      recentActivity,
    };
  }

  async listHistory(userId: string) {
    const history = await this.seekerRepository.listHistory(userId);

    return history.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      scheduledAt: job.scheduledAt,
      hourlyRateCents: job.hourlyRateCents,
      status: job.deletedAt ? 'deleted' : lowerCaseEnum(job.status),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      deletedAt: job.deletedAt,
    }));
  }

  async listExploreProviders(query: Record<string, unknown>) {
    const search =
      typeof query.q === 'string' && query.q.trim().length > 0
        ? query.q.trim()
        : undefined;

    const providers = await this.seekerRepository.listExploreProviders(search);

    return providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      surname: provider.surname,
      providerVerificationStatus: lowerCaseEnum(
        provider.providerVerificationStatus,
      ),
    }));
  }

  async getAccount(userId: string) {
    const account = await this.seekerRepository.getAccount(userId);
    if (!account) {
      throw new NotFoundException({
        code: 'SEEKER_NOT_FOUND',
        message: 'Care seeker account not found',
      });
    }

    return {
      ...account,
      role: lowerCaseEnum(account.role),
    };
  }

  async updateAccount(userId: string, rawPayload: unknown) {
    const payload = this.validateAccountUpdatePayload(rawPayload);
    const account = await this.seekerRepository.updateAccount(userId, payload);

    return {
      ...account,
      role: lowerCaseEnum(account.role),
    };
  }

  async updateSeekersInfo(userId: string, rawPayload: unknown) {
    const payload = this.validateSeekersInfoUpdatePayload(rawPayload);
    const info = await this.seekerRepository.upsertSeekersInfo(userId, payload);

    return {
      id: info.id,
      userId: info.userId,
      age: info.age,
      ethnicBackground: info.ethnicBackground
        ? lowerCaseEnum(info.ethnicBackground)
        : null,
      location: info.location,
      languagesSpoken: info.languagesSpoken.map((language) =>
        language.toLowerCase(),
      ),
      livingSituation: info.livingSituation
        ? lowerCaseEnum(info.livingSituation)
        : null,
      needsHelpBesidesHousehold: info.needsHelpBesidesHousehold,
      preferredCaregiverGender: info.preferredCaregiverGender
        ? lowerCaseEnum(info.preferredCaregiverGender)
        : null,
      preferredCaregiverLanguage: info.preferredCaregiverLanguage
        ? lowerCaseEnum(info.preferredCaregiverLanguage)
        : null,
      culturalConsiderationsPreference: info.culturalConsiderationsPreference
        ? lowerCaseEnum(info.culturalConsiderationsPreference)
        : null,
      culturalConsiderationsNotes: info.culturalConsiderationsNotes,
      scheduleVibe: info.scheduleVibe
        ? lowerCaseEnum(info.scheduleVibe)
        : null,
      homeAccessibility: info.homeAccessibility.map((item) =>
        item.toLowerCase(),
      ),
      careUrgency: info.careUrgency ? lowerCaseEnum(info.careUrgency) : null,
      careFor: info.careFor ? lowerCaseEnum(info.careFor) : null,
      basicCareNeeds: info.basicCareNeeds.map((need) => need.toLowerCase()),
      otherCareNeedDetails: info.otherCareNeedDetails,
      needsMedicalHelp: info.needsMedicalHelp,
      healthDisclosePreference: info.healthDisclosePreference
        ? lowerCaseEnum(info.healthDisclosePreference)
        : null,
      healthNotes: info.healthNotes,
      medicationsDisclosePreference: info.medicationsDisclosePreference
        ? lowerCaseEnum(info.medicationsDisclosePreference)
        : null,
      medicationsNotes: info.medicationsNotes,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
    };
  }

  private validateRegisterPayload(payload: unknown): RegisterSeekerPayload {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const body = payload as Record<string, unknown>;
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password =
      typeof body.password === 'string' ? body.password.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const surname =
      typeof body.surname === 'string' ? body.surname.trim() : '';
    const errors: string[] = [];

    if (!name) {
      errors.push('name is required');
    }

    if (!surname) {
      errors.push('surname is required');
    }

    if (!email) {
      errors.push('email is required');
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push('email must be a valid email address');
    }

    if (!password) {
      errors.push('password is required');
    } else if (password.length < 6) {
      errors.push('password must be at least 6 characters');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid seeker registration payload',
        errors,
      });
    }

    return { email, password, name, surname };
  }

  private validateSeekersInfoUpdatePayload(
    payload: unknown,
  ): UpdateSeekersInfoPayload {
    const body = ensureObject(payload);
    if (!body) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const section =
      typeof body.section === 'string' ? body.section.trim().toLowerCase() : '';

    if (section === 'about_you') {
      return this.validateAboutYouPayload(body);
    }

    if (section === 'care_health') {
      return this.validateCareHealthPayload(body);
    }

    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'section must be about_you or care_health',
    });
  }

  private validateAboutYouPayload(
    body: Record<string, unknown>,
  ): Extract<UpdateSeekersInfoPayload, { section: 'about_you' }> {
    const errors: string[] = [];
    const ageRaw = body.age;
    const age =
      typeof ageRaw === 'number'
        ? ageRaw
        : typeof ageRaw === 'string' && ageRaw.trim().length > 0
          ? Number(ageRaw)
          : NaN;

    if (!Number.isInteger(age) || age < 18 || age > 120) {
      errors.push('age must be a whole number between 18 and 120');
    }

    const ethnicBackground = this.parseEthnicBackground(
      body.ethnicBackground,
      errors,
    );

    const location =
      typeof body.location === 'string' ? body.location.trim() : '';
    if (!location) {
      errors.push('location is required');
    }

    const languagesSpoken = this.parseEnumArray(
      body.languagesSpoken,
      SPOKEN_LANGUAGES,
    ) as SpokenLanguage[];
    if (languagesSpoken.length === 0) {
      errors.push('languagesSpoken must include at least one option');
    }

    const livingSituation = this.parseRequiredEnum(
      body.livingSituation,
      LIVING_SITUATIONS,
      'livingSituation',
      errors,
    ) as LivingSituation | null;

    const livesWithSomeoneElse =
      livingSituation !== null && livingSituation !== LivingSituation.LIVE_ALONE;

    const needsHelpBesidesHouseholdRaw = body.needsHelpBesidesHousehold;
    const needsHelpBesidesHousehold =
      needsHelpBesidesHouseholdRaw === true ||
      needsHelpBesidesHouseholdRaw === 'yes'
        ? true
        : needsHelpBesidesHouseholdRaw === false ||
            needsHelpBesidesHouseholdRaw === 'no'
          ? false
          : null;

    if (livesWithSomeoneElse && needsHelpBesidesHousehold === null) {
      errors.push('needsHelpBesidesHousehold is required');
    }

    const preferredCaregiverGender = this.parseRequiredEnum(
      body.preferredCaregiverGender,
      PREFERRED_CAREGIVER_GENDERS,
      'preferredCaregiverGender',
      errors,
    ) as PreferredCaregiverGender | null;

    const preferredCaregiverLanguage = this.parseRequiredEnum(
      body.preferredCaregiverLanguage,
      SPOKEN_LANGUAGES,
      'preferredCaregiverLanguage',
      errors,
    ) as SpokenLanguage | null;

    const culturalConsiderationsPreference = this.parseDisclosePreference(
      body.culturalConsiderationsPreference ??
        body.culturalConsiderationsChoice,
      errors,
      'culturalConsiderationsPreference',
      false,
    );
    const culturalConsiderationsNotes =
      culturalConsiderationsPreference === DisclosePreference.SHARE
        ? (readOptionalString(body, 'culturalConsiderationsNotes', errors) ??
          null)
        : null;

    const scheduleVibe = this.parseRequiredEnum(
      body.scheduleVibe,
      SCHEDULE_VIBES,
      'scheduleVibe',
      errors,
    ) as ScheduleVibe | null;

    const homeAccessibility = this.parseEnumArray(
      body.homeAccessibility,
      HOME_ACCESSIBILITIES,
    ) as HomeAccessibility[];

    const careUrgency = this.parseRequiredEnum(
      body.careUrgency,
      CARE_URGENCIES,
      'careUrgency',
      errors,
    ) as CareUrgency | null;

    if (
      errors.length > 0 ||
      !ethnicBackground ||
      !livingSituation ||
      (livesWithSomeoneElse && needsHelpBesidesHousehold === null) ||
      !preferredCaregiverGender ||
      !preferredCaregiverLanguage ||
      !scheduleVibe ||
      !careUrgency
    ) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid about-you payload',
        errors,
      });
    }

    return {
      section: 'about_you',
      age,
      ethnicBackground,
      location,
      languagesSpoken,
      livingSituation,
      needsHelpBesidesHousehold: livesWithSomeoneElse
        ? needsHelpBesidesHousehold
        : null,
      preferredCaregiverGender,
      preferredCaregiverLanguage,
      culturalConsiderationsPreference,
      culturalConsiderationsNotes,
      scheduleVibe,
      homeAccessibility,
      careUrgency,
    };
  }

  private validateCareHealthPayload(
    body: Record<string, unknown>,
  ): Extract<UpdateSeekersInfoPayload, { section: 'care_health' }> {
    const errors: string[] = [];
    const needsMedicalHelpRaw = body.needsMedicalHelp;
    const needsMedicalHelp =
      needsMedicalHelpRaw === true || needsMedicalHelpRaw === 'yes'
        ? true
        : needsMedicalHelpRaw === false || needsMedicalHelpRaw === 'no'
          ? false
          : null;

    if (needsMedicalHelp === null) {
      errors.push('needsMedicalHelp is required');
    }

    const basicCareNeeds = this.parseBasicCareNeeds(body.basicCareNeeds);
    if (basicCareNeeds.length === 0) {
      errors.push('basicCareNeeds must include at least one option');
    }

    const includesOther = basicCareNeeds.includes(BasicCareNeed.OTHER);
    const otherCareNeedDetailsRaw = readOptionalString(
      body,
      'otherCareNeedDetails',
      errors,
    );
    const otherCareNeedDetails =
      typeof otherCareNeedDetailsRaw === 'string'
        ? otherCareNeedDetailsRaw
        : null;

    if (includesOther && !otherCareNeedDetails) {
      errors.push('otherCareNeedDetails is required when Other is selected');
    }

    const healthDisclosePreference = this.parseDisclosePreference(
      body.healthDisclosePreference ?? body.healthNotesChoice,
      errors,
      'healthDisclosePreference',
      needsMedicalHelp === true,
    );
    const medicationsDisclosePreference = this.parseDisclosePreference(
      body.medicationsDisclosePreference ?? body.medicationsChoice,
      errors,
      'medicationsDisclosePreference',
      needsMedicalHelp === true,
    );

    const healthNotes =
      healthDisclosePreference === DisclosePreference.SHARE
        ? (readOptionalString(body, 'healthNotes', errors) ?? null)
        : null;
    const medicationsNotes =
      medicationsDisclosePreference === DisclosePreference.SHARE
        ? (readOptionalString(body, 'medicationsNotes', errors) ?? null)
        : null;

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid seekers info payload',
        errors,
      });
    }

    return {
      section: 'care_health',
      needsMedicalHelp: needsMedicalHelp as boolean,
      healthDisclosePreference: needsMedicalHelp
        ? healthDisclosePreference
        : null,
      healthNotes: needsMedicalHelp ? healthNotes : null,
      medicationsDisclosePreference: needsMedicalHelp
        ? medicationsDisclosePreference
        : null,
      medicationsNotes: needsMedicalHelp ? medicationsNotes : null,
      basicCareNeeds,
      otherCareNeedDetails: includesOther ? otherCareNeedDetails : null,
    };
  }

  private parseEthnicBackground(
    value: unknown,
    errors: string[],
  ): EthnicBackground | null {
    return this.parseRequiredEnum(
      value,
      ETHNIC_BACKGROUNDS,
      'ethnicBackground',
      errors,
    ) as EthnicBackground | null;
  }

  private parseRequiredEnum(
    value: unknown,
    allowed: Set<string>,
    field: string,
    errors: string[],
  ): string | null {
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${field} is required`);
      return null;
    }

    const normalized = value.trim().toUpperCase();
    if (allowed.has(normalized)) {
      return normalized;
    }

    errors.push(`${field} is invalid`);
    return null;
  }

  private parseEnumArray(value: unknown, allowed: Set<string>): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const unique = new Set<string>();
    for (const item of value) {
      if (typeof item !== 'string') {
        continue;
      }

      const normalized = item.trim().toUpperCase();
      if (allowed.has(normalized)) {
        unique.add(normalized);
      }
    }

    return Array.from(unique);
  }

  private parseDisclosePreference(
    value: unknown,
    errors: string[],
    field: string,
    _required: boolean,
  ): DisclosePreference | null {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    const normalized = value.trim().toUpperCase();
    if (normalized === 'SHARE' || normalized === 'PREFER_NOT_TO_SAY') {
      return normalized as DisclosePreference;
    }

    errors.push(`${field} is invalid`);
    return null;
  }

  private parseBasicCareNeeds(value: unknown): BasicCareNeed[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const unique = new Set<BasicCareNeed>();

    for (const item of value) {
      if (typeof item !== 'string') {
        continue;
      }

      const normalized = item.trim().toUpperCase();
      if (BASIC_CARE_NEEDS.has(normalized)) {
        unique.add(normalized as BasicCareNeed);
      }
    }

    return Array.from(unique);
  }

  private validateAccountUpdatePayload(payload: unknown) {
    const body = ensureObject(payload);
    if (!body) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const errors: string[] = [];
    const name = readOptionalString(body, 'name', errors);
    const surname = readOptionalString(body, 'surname', errors);

    if (typeof name === 'undefined' && typeof surname === 'undefined') {
      errors.push('At least one field must be provided');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid account update payload',
        errors,
      });
    }

    return {
      ...(typeof name !== 'undefined' ? { name } : {}),
      ...(typeof surname !== 'undefined' ? { surname } : {}),
    };
  }
}
