import { Request, Response } from 'express';
import db from '../../models';

interface ValidateAffiliateCodeRequest {
  code: string;
}

const handleValidateAffiliateCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body as ValidateAffiliateCodeRequest;

    if (!code) {
      return res.status(400).json({
        error: 'Affiliate code is required',
      });
    }

    const affiliateCode = await db.AffiliateCode.findOne({
      where: {
        code: code.trim().toUpperCase(),
      },
    });

    if (!affiliateCode) {
      return res.status(404).json({
        error: 'Invalid affiliate code',
        valid: false,
      });
    }

    return res.status(200).json({
      message: 'Valid affiliate code',
      valid: true,
      code: affiliateCode.code,
    });
  } catch (error) {
    console.error('Error validating affiliate code:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

export default handleValidateAffiliateCode;
