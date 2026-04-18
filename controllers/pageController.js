/**
 * Page Controller
 * Handles rendering of static/public pages.
 */
const pageController = {
  /**
   * GET /
   * Renders the landing page.
   */
  home: (req, res) => {
    res.render('pages/home', {
      title: 'BookMySpace — University Room Booking',
    });
  },
};

module.exports = pageController;
