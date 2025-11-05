import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { kycVerifications } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) {
    return;
  }

  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      address,
      city,
      postalCode,
      country,
      phoneNumber,
      idDocumentType,
      idDocumentNumber,
      idDocumentUrl,
      selfieUrl,
      addressDocumentUrl
    } = req.body;

    const userId = authUser.userId;

    if (!idDocumentUrl || !selfieUrl || !addressDocumentUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingKYC = await db.select()
      .from(kycVerifications)
      .where(eq(kycVerifications.userId, userId))
      .limit(1);

    if (existingKYC.length > 0) {
      await db.update(kycVerifications)
        .set({
          firstName,
          lastName,
          dateOfBirth,
          nationality,
          address,
          city,
          postalCode,
          country,
          phoneNumber,
          idDocumentType,
          idDocumentNumber,
          idDocumentUrl,
          selfieUrl,
          addressDocumentUrl,
          status: 'pending',
          submittedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(kycVerifications.userId, userId));
    } else {
      await db.insert(kycVerifications).values({
        userId,
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        address,
        city,
        postalCode,
        country,
        phoneNumber,
        idDocumentType,
        idDocumentNumber,
        idDocumentUrl,
        selfieUrl,
        addressDocumentUrl,
        status: 'pending',
        submittedAt: new Date()
      });
    }

    return res.status(200).json({ 
      message: 'KYC verification submitted successfully',
      status: 'pending'
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
