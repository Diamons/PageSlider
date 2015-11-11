(function($){
    $.pageSlider = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("pageSlider", base);

        base.init = function(){
            base.options = $.extend({},$.pageSlider.defaultOptions, options);
            base.currentActiveSectionIndex = 0;
            base.$sections = $(base.options.pageSelector);
            base.$subnavigation = $(base.options.subnavigationSelector);
            base.$pageContainer = $(base.options.pageContainerSelector);
            base.cacheSectionPixelValues = []; // Empty array to store pixel values of sections

            // Put your initialization code here
            base.generateMenuFromSections();
            base.doSubnavigationPagination();
            base.setSectionHeightsAndPinCurtains();
        };

        base.generateMenuFromSections = function(){
          base.$subnavigation.html('');
          base.$sections.each(function() {
            // Old feature where data-showinmenu="false" would hide the page from the subnav but still scroll, keep disabled for now
            if($(this).data('showinmenu') === false){
              // base.$subnavigation.append('<li><a href="#" class="curtain-subnavigation__item hidden">'+sectionName+'</a></li>');
            } else {
              var sectionName = $(this).data('name') ? $(this).data('name') : base.options.defaultSubnavigationSectionText;
              var dataSection = sectionName.replace(/[|&;$%@"<>()+, ]/g, "").toLowerCase();
              base.$subnavigation.append('<li><a href="#" data-section="'+dataSection+'">'+sectionName+'</a></li>');
            }
          });
        };

        base.doSubnavigationPagination = function() {
          base.$subnavigation.find('li').not(':eq(' + base.currentActiveSectionIndex + ')').removeClass('active');
          base.$subnavigation.find('li').eq(base.currentActiveSectionIndex).addClass('active');
        }

        base.setSectionHeightsAndPinCurtains = function() {
          var renderedHeight = base.$el.outerHeight();
          base.$pageContainer.height(renderedHeight);
          /*
            Store how far from the top this element is, before we apply .curtain-pinned (position: absolute) to our panes
            and lose these values for our sections.
          */
          base.$sections.each(function(i) {
            $(this).data('top', $(this).offset().top);
            base.cacheSectionPixelValues[i] = {};
            // If not last, save end point
            if (i !== base.$sections.length-1) {
              base.cacheSectionPixelValues[i].endPoint = base.$sections.eq(i+1).offset().top; //+ borderOffset; // + 30; //30 is our 20pxborder/10pxmargin offset
              console.log(base.cacheSectionPixelValues[i].endPoint);
            } else {
              // Otherwise if last, the endpoint is where all the pages end
              base.cacheSectionPixelValues[i].endPoint = base.$pageContainer.height();
            }
          });

          /*
            On non-touch devices, add class curtain-pinned (position: absolute)
          */
          // if (!Modernizr.touch && !window.isMobileSize) {
          //   $panes.addClass('curtain-pinned');
          // }
        };

        // Run initializer
        base.init();
    };

    $.pageSlider.defaultOptions = {
        pageSelector: ".js-slider-page",
        pageContainerSelector: ".js-slider-wrapper",
        subnavigationSelector: ".js-slider-navigation",
        defaultSubnavigationSectionText: "Section",

    };

    $.fn.pageSlider = function(options){
        return this.each(function(){
            (new $.pageSlider(this, options));
        });
    };

})(jQuery);
