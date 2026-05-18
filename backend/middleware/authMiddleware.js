const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor_Model");
const Patient = require("../models/Patient_Model"); // Assuming you have a patient model
const Admin = require("../models/Admin_Model"); // 🟢 ADD THIS LINE (Make sure the filename matches your project exactly)

/**
 * PROTECT: Higher-order middleware to verify JWT
 * Ensures only logged-in users with a valid token can access the route.
 */
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in the Authorization header (Bearer Token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (split "Bearer <token>")
      // Get token from header (split "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token using your JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach User to the request (Optimized with parallel lookup)
      const [doctor, patient, admin] = await Promise.all([
        Doctor.findById(decoded.id).select("-password"),
        Patient.findById(decoded.id).select("-password"),
        Admin.findById(decoded.id).select("-password"), // 🟢 ADD THIS LINE TO FIND YOUR SUPERADMIN
      ]);

      // Assign whoever is found to req.user
      req.user = doctor || patient || admin;

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "User no longer exists in clinical registry." });
      }

      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      res.status(401).json({ message: "Not authorized, token failed." });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ message: "Access Denied: No medical token provided." });
  }
};

/**
 * AUTHORIZE: Role-based access control
 * Use this to restrict certain routes (like Leave Management) to Doctors only.
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Assuming your user object has a 'role' field (e.g., 'doctor' or 'patient')
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role [${req.user.role}] is not authorized to access this resource.`,
      });
    }
    next();
  };
};
