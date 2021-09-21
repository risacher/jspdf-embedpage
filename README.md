# jspdf-embedpage

plugin for jsPDF that will take an existing page (the source page) in a PDF, and embed
it into the current page (the target page). Optionally scale, translate & rotating the 
source page as it is embedded.  (Then you can go back and delete the source page if you want).

```
doc.embedPage(sourcePageNum, { 
    angle: 180, 
    yoffset: pheight-printermargin, xoffset: pwidth-printermargin, 
    xscale: 1, yscale: 0.9 
} );
```

This works great for making 2-up or 4-up pages.  For example, create pages that are half
the size of the paper, then render whatever you want on it.  Finally, use embedPage() to 
combine the half-size pages onto the full-size output page, maybe flipping alternate pages 
upside-down so that it prints correctly on a duplex printer.

