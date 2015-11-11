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
            base.markActiveSlideBasedOnWindowPosition();
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
            Add class pinned (position: absolute)
          */
          base.$sections.addClass('pinned');
        };

        /*
          On page load, figure out which slide is presented based on load position.
        */
        base.markActiveSlideBasedOnWindowPosition = function() {
          var windowPosition = $(window).scrollTop();
          for(var x = 0; x < base.cacheSectionPixelValues.length -1; x++) {
            /*
              Find which panes we are in between and bring that pane to the front.
            */
            var activeSectionIndexFound = false;
            if(windowPosition <= base.cacheSectionPixelValues[0].endPoint) {
              base.currentActiveSectionIndex = 0;
              activeSectionIndexFound = true;
            }
            else if(windowPosition >= base.cacheSectionPixelValues[x].endPoint && windowPosition <= base.cacheSectionPixelValues[x+1].endPoint) {
              base.currentActiveSectionIndex = x+1;
              activeSectionIndexFound = true;
            } else if(windowPosition >= base.cacheSectionPixelValues[base.cacheSectionPixelValues.length - 1].endPoint){
              base.currentActiveSectionIndex = base.cacheSectionPixelValues.length - 1;
              activeSectionIndexFound = true;
            }

            if(activeSectionIndexFound) {
              var $activePane = base.$sections.eq(base.currentActiveSectionIndex);
              base.currentActiveSectionIndex = $activePane.parent().index()-1;
              /*
                On non-touch devices, add our curtain effect with .next (position:fixed) for the background element
                (the one being scrolled into so it never moves)
              */
              if(base.currentActiveSectionIndex !== 0) {
                var combinedHeights = base.getCombinedHeightsUpToPane(base.currentActiveSectionIndex);
                $activePane.removeClass('next').addClass('transitioning');

                $panes.eq(base.currentActiveSectionIndex+1).addClass('next').css({'top': 0});
                $activePane.css({'top': combinedHeights});
              }
              x = base.cacheSectionPixelValues.length;
              return;
            }

          }

          _doSubnavigationPagination();
          _toggleSubnavigationDisplayBasedOnPosition();
        };

        base.getCombinedHeightsUpToPane = function(index) {
          if(index <= 0) {
            return 0;
          }
          // console.log(cachePixelValues);
          var combinedHeightsTmp = 0;
          return cachePixelValues[index-1].endPoint - $curtainsWrapper.offset().top; //Works much better
        }

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
