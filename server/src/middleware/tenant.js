export const requireSameCollege = (req, res, next) => {
  if (!req.collegeId) return next(); // SUPER_ADMIN

  const targetCollege =
    req.body.college ||
    req.params.collegeId ||
    req.query.collegeId;

  if (targetCollege && String(targetCollege) !== String(req.collegeId)) {
    return res.status(403).json({ message: "Cross-college access denied" });
  }

  next();
};

export const requireCollegeContext = (req, res, next) => {
  if (req.user?.role === "SUPER_ADMIN") return next();
  if (!req.user?.college) {
    return res.status(400).json({ message: "College context missing" });
  }
  next();
};

export const requireSemesterContext = (req, res, next) => {
  if (!req.user?.semester) {
    return res.status(400).json({ message: "Semester context missing" });
  }
  next();
};
