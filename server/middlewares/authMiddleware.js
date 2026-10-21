import { clerkClient, getAuth } from "@clerk/express";

// Middleware (Projext Educator Routes)
export const protectEducator= async (req, res, next)=>{
    try{
       

          const auth = getAuth(req);

           console.log("AUTH DEBUG:", {
             authorizationHeaderPresent: Boolean(req.headers.authorization),
             isAuthenticated: auth.isAuthenticated,
            userIdPresent: Boolean(auth.userId),
           });

    const { isAuthenticated, userId } = auth;

    if (!isAuthenticated || !userId) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata?.role !== "educator") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

        next()

    } catch (error) {
           res.json({success: false, message: error.message})
    }
}