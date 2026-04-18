/**
 * Middleware: Requires the user to be logged in.
 * Redirects to /login if no session user exists.
 */
const requiresAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
};

/**
 * Middleware: Requires the user to be an admin.
 * Must be used after requiresAuth.
 * Returns 403 if the user's role is not 'admin'.
 */
const requiresAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('pages/error', {
      title: 'Forbidden',
      message: 'You do not have permission to access this page.',
    });
  }
  next();
};

module.exports = { requiresAuth, requiresAdmin };
