import { clerkClient, getAuth } from "@clerk/express";

// Protect all educator-only API routes using Clerk's server-side public metadata.
export const protectEducator = async (req, res, next) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role;

    console.log("EDUCATOR ROLE CHECK:", { userId, role });

    if (role !== "educator") {
      return res.status(403).json({
        success: false,
        message: "Educator access only",
      });
    }

    return next();
  } catch (error) {
    console.error("protectEducator error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify educator permissions",
    });
  }
};


 