import Credential from "../models/Credential.js";
import AuditLog from "../models/AuditLog.js";

export const getStats = async (req, res) => {
    try {
        const totalCredentials = await Credential.countDocuments();
        const successfulVerifications = await AuditLog.countDocuments({ status: 'verified' });
        const failedVerifications = await AuditLog.countDocuments({ status: 'rejected' });
        
        res.json({ 
          totalCredentials, 
          successfulVerifications,
          totalVerifications: successfulVerifications + failedVerifications
        });
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch network stats" });
      }
};