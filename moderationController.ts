import { Request, Response } from 'express';
import { getDatabase } from './db';

// 1. UPDATE USER ACCOUNT RESTRICTION STATUS (None, Restricted, Spam_Flagged, Banned)
export async function updateUserRestriction(req: Request, res: Response) {
  try {
    const { targetUserId, newStatus } = req.body;

    // Validate if the input status matches your specification options
    const validStatuses = ['None', 'Restricted', 'Spam_Flagged', 'Banned'];
    if (!targetUserId || !validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: "Invalid target user ID or restriction status payload." });
    }

    const db = await getDatabase();

    // Check if user exists before attempting update
    const userExists = await db.get('SELECT username FROM users WHERE user_id = ?', [targetUserId]);
    if (!userExists) {
      return res.status(404).json({ error: "Target creator account not found." });
    }

    // Apply the restriction status to the user profile record
    await db.run(
      'UPDATE users SET restriction_status = ?, is_online = 0 WHERE user_id = ?',
      [newStatus, targetUserId]
    );

    return res.status(200).json({
      success: true,
      message: `Account status successfully updated to: ${newStatus}`,
      details: { targetUserId, status: newStatus }
    });

  } catch (error) {
    console.error("Moderation Error:", error);
    return res.status(500).json({ error: "Internal server moderation loop failure." });
  }
}

// 2. FETCH ALL SPAM-FLAGGED OR RESTRICTED ACCOUNTS FOR ADMIN VIEW
export async function getFlaggedAccounts(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    
    // Pull any account that has a restriction applied to it
    const flaggedUsers = await db.all(
      "SELECT user_id, username, email, phone_number, restriction_status FROM users WHERE restriction_status != 'None'"
    );

    return res.json(flaggedUsers);
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve restricted database entries." });
  }
}
