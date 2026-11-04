import { Injectable } from '@nestjs/common';
import {
  Prisma,
  type ProviderDocument,
  type ProviderDocumentCategory,
  type StorageProvider,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';

export type CreateProviderDocumentData = {
  providerId: string;
  category: ProviderDocumentCategory;
  originalFilename: string;
  storageKey: string;
  storageProvider: StorageProvider;
  mimeType: string;
  sizeBytes: number;
};

export type ReplaceProviderDocumentData = Omit<
  CreateProviderDocumentData,
  'providerId' | 'category'
> & { category?: ProviderDocumentCategory };

@Injectable()
export class ProviderDocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listActive(providerId: string): Promise<ProviderDocument[]> {
    return this.prisma.providerDocument.findMany({
      where: { providerId, deletedAt: null },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });
  }

  countActive(providerId: string): Promise<number> {
    return this.prisma.providerDocument.count({
      where: { providerId, deletedAt: null },
    });
  }

  /** Scoped by provider so a document id alone never grants access. */
  findActive(
    providerId: string,
    documentId: string,
  ): Promise<ProviderDocument | null> {
    return this.prisma.providerDocument.findFirst({
      where: { id: documentId, providerId, deletedAt: null },
    });
  }

  create(data: CreateProviderDocumentData): Promise<ProviderDocument> {
    return this.prisma.providerDocument.create({ data });
  }

  replace(
    documentId: string,
    data: ReplaceProviderDocumentData,
  ): Promise<ProviderDocument> {
    return this.prisma.providerDocument.update({
      where: { id: documentId },
      data,
    });
  }

  softDelete(documentId: string): Promise<ProviderDocument> {
    return this.prisma.providerDocument.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });
  }

  isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
