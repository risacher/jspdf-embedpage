/** @preserve
 * jsPDF embedPage plugin
 * @author Dan Risacher @risacher
 * MIT license.
 * */
/**
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */
;(function(API) {
  'use strict';

  /**
   * embed a page from the PDF into the current page.
   * @name embedPage
   * @memberOf jsPDF
   * @function
   * @param {number} [sourcePage] - Which page to embed (starting a 1)
   * @param {object} [options] - hash of transformation options
   * @param {number} [options.xoffset=0] - Where to embed source page
   *    from left side of current page (units declared at doc creation)
   * @param {number} [options.xoffset=0] - Where to embed source page
   *    from left side of current page (units declared at doc creation)
   * @param {number} [options.yoffset=0] - Where to embed source page
   *    from top of current page (units declared at doc creation)
   * @param {number} [options.angle=0] - How much to rotate the embeded page
   *    counterclockwise around upper left corner. Expects the angle in degree.
   * @param {number} [options.xscale=1] - How much to scale embeded
   *    source page in its own x dimension
   * @param {number} [options.yscale=1] - How much to scale embeded
   *    source page in its own y dimension
   * @instance
   * @return {jsPDF}
   */
  API.embedPage = function embedPage(sourcePage, options) {
    let matrix;
    const out = this.internal.out;
    const f2 = this.internal.f2;
    const targetPage = this.internal.getCurrentPageInfo().pageNumber;
    this.setPage(sourcePage);
    // sourcePageHeight is in points (i.e. inch/72)
    const sourcePageHeight = parseFloat(
        this.internal.getVerticalCoordinateString(0));
    this.setPage(targetPage);

    out('q'); // save Graphics State
    if (typeof (options) !== 'object') {
      options = {};
    }

    // The origin in PDF is lower left (going up), but for jsPDF is
    // top left (going down), so minor magic is required to make
    // transformations sensible [**]

    // the jsPDF API changed and this code hasn't worked since 2019-ish.
    // see above for functioning workaround to get sourcePageHeight
    // var info = this.internal.getPageInfo(sourcePage);
    // var mediaBox = info.pageContext.mediaBox;
    //    var sourcePageHeight = mediaBox.topRightY - mediaBox.bottomLeftY;
    // var pagedim = this.pagedim[sourcePage];
    if (typeof (options.xoffset) === 'undefined') {
      options.xoffset = 0;
    }
    if (typeof (options.yoffset) === 'undefined') {
      options.yoffset = 0;
    }
    if (typeof (options.xscale) === 'undefined') {
      options.xscale = 1;
    }
    if (typeof (options.yscale) === 'undefined') {
      options.yscale = 1;
    }

    matrix = [1, 0, 0, 1, 0, 0];
    matrix[4] = this.internal.getCoordinateString(options.xoffset);
    // matrix[4] = f2(getHorizontalCoordinate(options.xoffset));

    matrix[5] = this.internal.f2(
        parseFloat(this.internal.getVerticalCoordinateString(options.yoffset)) -
        sourcePageHeight);
    out(matrix.join(' ') + ' cm'); // translate

    let angle = options.angle;
    if (angle) {
      // move origin to topleft of source page
      matrix = [1, 0, 0, 1, 0, sourcePageHeight];
      out(matrix.join(' ') + ' cm'); //

      angle *= (Math.PI / 180);
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      matrix = [f2(c), f2(s), f2(s * -1), f2(c), 0, 0];
      out(matrix.join(' ') + ' cm'); // rotate

      matrix = [f2(options.xscale), 0, 0, f2(options.yscale), 0, 0];
      out(matrix.join(' ') + ' cm'); // scale

      // move origin back to bottomleft
      matrix = [1, 0, 0, 1, 0, f2(-1 * sourcePageHeight)];
      out(matrix.join(' ') + ' cm');
    }

    this.internal.pages[sourcePage].forEach((e) => out(e));
    out('Q'); // restore graphics state
    return this;
  };
})(typeof (jsPDF) === 'undefined' ? jspdf.jsPDF.API : jsPDF.API);
