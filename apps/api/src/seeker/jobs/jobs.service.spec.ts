import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { JobRecord, JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';

const USER_ID = '66666666-6666-4666-8666-666666666666';
const RECIPIENT_ID = '77777777-7777-4777-8777-777777777777';
/** Internal primary key — never returned by the API. */
const JOB_PK = '88888888-8888-4888-8888-888888888888';
/** Public job id (`jobs.jobId`). */
const JOB_ID = '3f9a1c2b7d4e8f60';
const TODAY = new Date('2026-08-06T12:00:00.000Z');
const NOW = new Date('2026-08-06T12:30:00.000Z');

/** An on-behalf profile as `JobsRepository.findProfile` returns it. */
const profile = {
  registrantsInfo: { relationship: 'CHILD' },
  careRecipient: {
    id: RECIPIENT_ID,
    name: 'Rosa',
    dateOfBirth: new Date('1944-03-09T00:00:00.000Z'),
    gender: 'FEMALE',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
  },
  seekersInfo: {
    mobilityLevel: 'WALKING_AID',
    languagesSpoken: ['SPANISH'],
    otherLanguage: null,
    careUrgency: 'WITHIN_A_WEEK',
    preferredCaregiverGender: 'FEMALE',
    preferredCaregiverLanguage: 'SPANISH',
    homeAccessibility: ['STAIRS'],
    culturalConsiderationsNotes: 'Catholic',
  },
  carePreferences: {
    careFrequency: 'WEEKLY',
    careTasks: ['MEAL_PREPARATION', 'COMPANIONSHIP'],
    visitDate: null,
    visitStartTime: null,
    visitEndTime: null,
    visitNotes: null,
    hoursPerWeek: 10,
    careDuration: 'MEDIUM_TERM',
    scheduleFlexible: false,
    needsOvernightCare: false,
    needsLiveInCare: false,
    needsEmergencyCover: true,
    requiresCaregiverVehicle: false,
    requiresWheelchairAccessibleVehicle: false,
    petsInHome: true,
    specialRequirements: 'Low-sodium diet.',
    requiredQualifications: ['CNA'],
    minYearsExperience: 2,
    paymentType: 'HOURLY',
    budgetCents: 2800,
  },
  // Unordered on purpose: the draft sorts days and windows.
  careScheduleDays: [
    { dayOfWeek: 4, mode: 'ALL_DAY' },
    { dayOfWeek: 2, mode: 'AVAILABLE_WINDOWS' },
  ],
  careScheduleWindows: [
    { dayOfWeek: 2, startTime: '14:00', endTime: '17:00', endsNextDay: false },
    { dayOfWeek: 2, startTime: '08:00', endTime: '11:00', endsNextDay: false },
  ],
};

const expectedDetails = {
  careFrequency: 'weekly',
  careTasks: ['meal_preparation', 'companionship'],
  visit: null,
  recurring: {
    hoursPerWeek: 10,
    careDuration: 'medium_term',
    careUrgency: 'within_a_week',
    scheduleDays: [
      {
        dayOfWeek: 2,
        mode: 'available_windows',
        windows: [
          { start: '08:00', end: '11:00', endsNextDay: false },
          { start: '14:00', end: '17:00', endsNextDay: false },
        ],
      },
      { dayOfWeek: 4, mode: 'all_day', windows: [] },
    ],
    needsLiveInCare: false,
    needsEmergencyCover: true,
  },
  scheduleFlexible: false,
  needsOvernightCare: false,
  requiresCaregiverVehicle: false,
  requiresWheelchairAccessibleVehicle: false,
  petsInHome: true,
  homeAccessibility: ['stairs'],
  specialRequirements: 'Low-sodium diet.',
  budget: { paymentType: 'hourly', amountCents: 2800 },
  caregiverPreferences: {
    gender: 'female',
    language: 'spanish',
    requiredQualifications: ['cna'],
    minYearsExperience: 2,
    culturalConsiderations: 'Catholic',
  },
};

/** A job as the repository returns it after saving `body`. */
const savedJobRecord = (body: {
  title: string;
  description: string;
}): Partial<JobRecord> => {
  return {
    id: JOB_PK,
    jobId: JOB_ID,
    seekerId: USER_ID,
    careRecipientId: RECIPIENT_ID,
    title: body.title,
    description: body.description,
    status: 'OPEN',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    location: null,
    scheduledAt: null,
    hourlyRateCents: null,
    careFrequency: 'WEEKLY',
    careTasks: ['COMPANIONSHIP'],
    visitDate: null,
    visitStartTime: null,
    visitEndTime: null,
    visitNotes: null,
    hoursPerWeek: 6,
    careDuration: 'SHORT_TERM',
    careUrgency: 'ASAP',
    scheduleFlexible: true,
    needsOvernightCare: false,
    needsLiveInCare: false,
    needsEmergencyCover: false,
    requiresCaregiverVehicle: false,
    requiresWheelchairAccessibleVehicle: false,
    petsInHome: false,
    homeAccessibility: [],
    specialRequirements: null,
    paymentType: 'HOURLY',
    budgetCents: null,
    preferredCaregiverGender: 'FEMALE',
    preferredCaregiverLanguage: null,
    requiredQualifications: [],
    minYearsExperience: null,
    culturalConsiderations: null,
    scheduleDays: [{ jobId: JOB_PK, dayOfWeek: 1, mode: 'ALL_DAY' }],
    scheduleWindows: [],
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  };
};

describe('JobsService', () => {
  const repository = {
    findProfile: jest.fn(),
    findCareRecipientId: jest.fn(),
    createJobPost: jest.fn(),
    findJob: jest.fn(),
    softDeleteJob: jest.fn(),
    replaceJobPost: jest.fn(),
    updateLifecycle: jest.fn(),
    listJobs: jest.fn(),
  };
  let service: JobsService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findProfile.mockResolvedValue(profile);
    repository.findCareRecipientId.mockResolvedValue(RECIPIENT_ID);
    service = new JobsService(repository as unknown as JobsRepository);
  });

  describe('getDraft', () => {
    it('prefills the post from the profile and writes its text', async () => {
      const { source, draft } = await service.getDraft(USER_ID, TODAY);

      expect(source).toEqual({
        careRecipientId: RECIPIENT_ID,
        careRecipientName: 'Rosa',
      });
      expect(draft).toEqual({
        title: 'Part-time caregiver for my mother in Austin, TX',
        description: expect.stringMatching(
          /^I am looking for a caregiver to help my 82-year-old mother in Austin, TX with meal preparation and companionship\. Care is needed on Tuesdays and Thursdays \(about 10 hours a week\)\./,
        ),
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        details: expectedDetails,
      });
    });

    it('keeps the name and street address out of the shareable text', async () => {
      repository.findProfile.mockResolvedValue({
        ...profile,
        careRecipient: { ...profile.careRecipient, addressLine1: '1 Main St' },
      });
      const { draft } = await service.getDraft(USER_ID, TODAY);

      expect(`${draft.title} ${draft.description}`).not.toMatch(/Rosa|Main St/);
      expect(draft).not.toHaveProperty('addressLine1');
    });

    it('returns an empty draft for accounts registered for oneself', async () => {
      repository.findProfile.mockResolvedValue({
        registrantsInfo: null,
        careRecipient: null,
        seekersInfo: { ...profile.seekersInfo },
        carePreferences: null,
        careScheduleDays: [],
        careScheduleWindows: [],
      });

      await expect(service.getDraft(USER_ID, TODAY)).resolves.toEqual({
        source: null,
        draft: {
          title: '',
          description: '',
          city: '',
          state: '',
          postalCode: '',
          details: null,
        },
      });
    });

    it('prefills the location only when care needs were never saved', async () => {
      repository.findProfile.mockResolvedValue({
        ...profile,
        carePreferences: null,
      });
      const { draft } = await service.getDraft(USER_ID, TODAY);

      expect(draft).toMatchObject({ title: '', city: 'Austin', details: null });
    });
  });

  describe('generateText', () => {
    it('writes text for edited details with the profile context', async () => {
      const text = await service.generateText(
        USER_ID,
        {
          city: 'Dallas',
          state: 'TX',
          postalCode: '75201',
          details: {
            careFrequency: 'one_time',
            careTasks: ['transportation_driving'],
            visit: { date: '2026-08-12', startTime: '09:00', endTime: '11:00' },
            scheduleFlexible: false,
            requiresWheelchairAccessibleVehicle: false,
            petsInHome: false,
            budget: { paymentType: 'fixed_price', amountCents: 6000 },
            caregiverPreferences: { gender: 'no_preference' },
          },
        },
        TODAY,
      );

      expect(text.title).toBe(
        'One-time visit on Aug 12: driving for my mother in Dallas, TX',
      );
      expect(text.description).toContain('The caregiver needs their own car.');
    });

    it('rejects invalid details', async () => {
      await expect(
        service.generateText(USER_ID, { city: 'Dallas' }, TODAY),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.findProfile).not.toHaveBeenCalled();
    });
  });

  describe('createJob', () => {
    const body = {
      title: 'Part-time caregiver for my mother in Austin, TX',
      description: 'I am looking for a caregiver to help my mother at home.',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      details: {
        careFrequency: 'weekly',
        careTasks: ['companionship'],
        recurring: {
          hoursPerWeek: 6,
          careDuration: 'short_term',
          careUrgency: 'asap',
          scheduleDays: [{ dayOfWeek: 1, mode: 'all_day' }],
          needsLiveInCare: false,
          needsEmergencyCover: false,
        },
        scheduleFlexible: true,
        requiresWheelchairAccessibleVehicle: false,
        petsInHome: false,
        budget: { paymentType: 'hourly', amountCents: null },
        caregiverPreferences: { gender: 'female' },
      },
    };

    it('saves an open job linked to the care recipient', async () => {
      const record = savedJobRecord(body);
      repository.createJobPost.mockResolvedValue(record);

      const job = await service.createJob(USER_ID, body, TODAY);

      expect(repository.createJobPost).toHaveBeenCalledWith(
        USER_ID,
        RECIPIENT_ID,
        expect.objectContaining({
          title: body.title,
          city: 'Austin',
          details: expect.objectContaining({
            careFrequency: 'WEEKLY',
            careTasks: ['COMPANIONSHIP'],
          }),
        }),
      );
      expect(job).not.toHaveProperty('id');
      expect(job).toMatchObject({
        jobId: JOB_ID,
        status: 'open',
        careRecipientId: RECIPIENT_ID,
        city: 'Austin',
        details: {
          careFrequency: 'weekly',
          recurring: {
            scheduleDays: [{ dayOfWeek: 1, mode: 'all_day', windows: [] }],
          },
          caregiverPreferences: { gender: 'female' },
        },
      });
    });

    it('saves nothing when the post is invalid', async () => {
      await expect(
        service.createJob(USER_ID, { ...body, title: '' }, TODAY),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.createJobPost).not.toHaveBeenCalled();
    });
  });

  describe('single jobs by public jobId', () => {
    const body = {
      title: 'Part-time caregiver for my mother in Austin, TX',
      description: 'I am looking for a caregiver to help my mother at home.',
    };

    it('looks the job up by jobId and never returns the internal id', async () => {
      repository.findJob.mockResolvedValue(savedJobRecord(body));

      const job = await service.getJob(USER_ID, JOB_ID);

      expect(repository.findJob).toHaveBeenCalledWith(USER_ID, JOB_ID);
      expect(job).toMatchObject({ jobId: JOB_ID, title: body.title });
      expect(job).not.toHaveProperty('id');
    });

    it('rejects malformed ids — including internal UUIDs — before querying', async () => {
      for (const bad of [JOB_PK, '3F9A1C2B7D4E8F60', '3f9a1c2b', 'draft']) {
        await expect(service.getJob(USER_ID, bad)).rejects.toBeInstanceOf(
          BadRequestException,
        );
      }
      expect(repository.findJob).not.toHaveBeenCalled();
    });

    it('answers 404 for unknown (or other seekers’) jobs', async () => {
      repository.findJob.mockResolvedValue(null);
      await expect(service.getJob(USER_ID, JOB_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('soft-deletes by the internal id found through jobId', async () => {
      const record = savedJobRecord(body);
      repository.findJob.mockResolvedValue(record);
      repository.softDeleteJob.mockResolvedValue({
        ...record,
        deletedAt: NOW,
      });

      await service.deleteJob(USER_ID, JOB_ID);

      expect(repository.softDeleteJob).toHaveBeenCalledWith(JOB_PK);
    });
  });

  describe('editing and lifecycle (by public jobId)', () => {
    const post = {
      title: 'Morning caregiver for my mother in Austin, TX',
      description: 'I am looking for a caregiver to help my mother at home.',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      details: {
        careFrequency: 'weekly',
        careTasks: ['companionship', 'meal_preparation'],
        recurring: {
          hoursPerWeek: 8,
          careDuration: 'long_term',
          careUrgency: 'asap',
          scheduleDays: [
            {
              dayOfWeek: 2,
              mode: 'available_windows',
              windows: [{ start: '09:00', end: '13:00' }],
            },
          ],
          needsLiveInCare: false,
          needsEmergencyCover: false,
        },
        scheduleFlexible: false,
        requiresWheelchairAccessibleVehicle: false,
        petsInHome: false,
        budget: { paymentType: 'hourly', amountCents: 2800 },
        caregiverPreferences: { gender: 'no_preference' },
      },
    };
    const withStatus = (status: string) => ({
      ...savedJobRecord(post),
      status,
    });
    const conflictCode = async (run: Promise<unknown>) => {
      try {
        await run;
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        return ((error as ConflictException).getResponse() as { code: string })
          .code;
      }
      throw new Error('expected a 409');
    };

    it('replaces the post of an open job and records the edit', async () => {
      repository.findJob.mockResolvedValue(withStatus('OPEN'));
      repository.replaceJobPost.mockImplementation(
        (_id: string, _input: unknown, editedAt: Date) => ({
          ...withStatus('OPEN'),
          title: post.title,
          editedAt,
        }),
      );

      const job = await service.editJob(USER_ID, JOB_ID, post, TODAY);

      expect(repository.replaceJobPost).toHaveBeenCalledWith(
        JOB_PK,
        expect.objectContaining({
          title: post.title,
          details: expect.objectContaining({
            careFrequency: 'WEEKLY',
            careTasks: ['COMPANIONSHIP', 'MEAL_PREPARATION'],
          }),
        }),
        expect.any(Date),
      );
      expect(job).toMatchObject({ jobId: JOB_ID, title: post.title });
      expect(job.editedAt).toBeInstanceOf(Date);
    });

    it('only edits open jobs', async () => {
      for (const status of ['PAUSED', 'IN_PROGRESS', 'CLOSED']) {
        repository.findJob.mockResolvedValue(withStatus(status));
        await expect(
          conflictCode(service.editJob(USER_ID, JOB_ID, post, TODAY)),
        ).resolves.toBe('JOB_NOT_EDITABLE');
      }
      expect(repository.replaceJobPost).not.toHaveBeenCalled();
    });

    it('validates an edit like a new post and saves nothing when invalid', async () => {
      repository.findJob.mockResolvedValue(withStatus('OPEN'));
      await expect(
        service.editJob(USER_ID, JOB_ID, { ...post, title: '' }, TODAY),
      ).rejects.toBeInstanceOf(BadRequestException);
      repository.findJob.mockResolvedValue(null);
      await expect(
        service.editJob(USER_ID, JOB_ID, post, TODAY),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.replaceJobPost).not.toHaveBeenCalled();
    });

    it('pauses open jobs and resumes paused ones', async () => {
      repository.updateLifecycle.mockImplementation(
        (_id: string, data: Record<string, unknown>) => ({
          ...withStatus(String(data.status)),
          pausedAt: data.pausedAt ?? null,
        }),
      );

      repository.findJob.mockResolvedValue(withStatus('OPEN'));
      const paused = await service.pauseJob(USER_ID, JOB_ID);
      expect(repository.updateLifecycle).toHaveBeenLastCalledWith(JOB_PK, {
        status: 'PAUSED',
        pausedAt: expect.any(Date),
      });
      expect(paused).toMatchObject({ status: 'paused' });

      repository.findJob.mockResolvedValue(withStatus('PAUSED'));
      const resumed = await service.resumeJob(USER_ID, JOB_ID);
      expect(repository.updateLifecycle).toHaveBeenLastCalledWith(JOB_PK, {
        status: 'OPEN',
        pausedAt: null,
      });
      expect(resumed).toMatchObject({ status: 'open', pausedAt: null });
    });

    it('refuses pausing / resuming in the wrong status', async () => {
      repository.findJob.mockResolvedValue(withStatus('PAUSED'));
      await expect(
        conflictCode(service.pauseJob(USER_ID, JOB_ID)),
      ).resolves.toBe('JOB_NOT_PAUSABLE');
      repository.findJob.mockResolvedValue(withStatus('OPEN'));
      await expect(
        conflictCode(service.resumeJob(USER_ID, JOB_ID)),
      ).resolves.toBe('JOB_NOT_PAUSED');
      expect(repository.updateLifecycle).not.toHaveBeenCalled();
    });

    it('closes open jobs only; others need an admin or are finished', async () => {
      repository.updateLifecycle.mockImplementation(
        (_id: string, data: Record<string, unknown>) => ({
          ...withStatus(String(data.status)),
          closedAt: data.closedAt,
        }),
      );
      repository.findJob.mockResolvedValue(withStatus('OPEN'));
      const closed = await service.closeJob(USER_ID, JOB_ID);
      expect(repository.updateLifecycle).toHaveBeenCalledWith(JOB_PK, {
        status: 'CLOSED',
        closedAt: expect.any(Date),
      });
      expect(closed).toMatchObject({ status: 'closed' });

      repository.updateLifecycle.mockClear();
      repository.findJob.mockResolvedValue(withStatus('PAUSED'));
      await expect(
        conflictCode(service.closeJob(USER_ID, JOB_ID)),
      ).resolves.toBe('CLOSURE_NEEDS_APPROVAL');
      repository.findJob.mockResolvedValue(withStatus('CLOSED'));
      await expect(
        conflictCode(service.closeJob(USER_ID, JOB_ID)),
      ).resolves.toBe('JOB_FINISHED');
      expect(repository.updateLifecycle).not.toHaveBeenCalled();
    });

    it('lists running jobs, paused ones included', async () => {
      repository.listJobs.mockResolvedValue([withStatus('PAUSED')]);
      const jobs = await service.listJobs(USER_ID);
      expect(repository.listJobs).toHaveBeenCalledWith(USER_ID, [
        'OPEN',
        'PAUSED',
        'IN_PROGRESS',
      ]);
      expect(jobs[0]).toMatchObject({ jobId: JOB_ID, status: 'paused' });
    });
  });
});
