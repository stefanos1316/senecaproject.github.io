/* ==========================================================================

    Project: ABET Symposium
    Author: XHTMLized
    Last updated: Tue Mar 15 2016 16:09:32

   ========================================================================== */

'use strict';

var ABET = {
  $BODY: $('body'),
  $WINDOW: $(window),

  /**
   * Init function.
   */
  init: function() {
    window.viewportUnitsBuggyfill.init();

    ABET.Header.init();
    ABET.HomePage.init();
    ABET.ScheduleTabs.init();
    ABET.Navigation.init();
    ABET.Sliders.init();
    ABET.Schedule.init();
    ABET.PageMap.init();
  },

  /**
   * Module for handling header interaction.
   */
  Header: {
    init: function() {
      ABET.Header.bindToggleMobileNavigation();
      ABET.Header.bindExpandedStyle();
    },

    bindToggleMobileNavigation: function() {
      var $header = $('.header');

      ABET.$BODY.on('click', '.header__toggle', function(event) {
        $header.toggleClass('header--open');
        event.stopPropagation();
      });

      ABET.$BODY.on('click', function(event) {
        if ($(event.target).closest('.header__navigation').length === 0) {
          $header.removeClass('header--open');
        }
      });
    },

    bindExpandedStyle: function() {
      var $header = $('.header');
      var height = $header.outerHeight();
      var collapse = $header.hasClass('header--expanded');

      ABET.$WINDOW
        .on('scroll resize', $.throttle(100, function() {
          $header.toggleClass('header--expanded', collapse ? ABET.$WINDOW.scrollTop() === 0 : ABET.$WINDOW.scrollTop() > height);
        }))
        .trigger('resize');
    }
  },

  /**
   * Module for handling Home page interaction.
   */
  HomePage: {
    init: function() {
      enquire.register('(min-width: 1025px)', {
        match: function() {
          ABET.HomePage.initFullPage();
        },
        unmatch: function() {
          ABET.HomePage.destroyFullPage();
        },
      });
      enquire.register('(max-width: 1024px)', {
        match: function() {
          ABET.Navigation.bindHeaderNavigation();
        },
        unmatch: function() {
          ABET.Navigation.unbindHeaderNavigation();
        },
      });
    },

    toggleSelectAndAppearance: function(index, nextIndex) {
      $('.register-now').toggleClass('register-now--on', nextIndex > 1);
      $('.header').toggleClass('header--expanded', nextIndex > 1);
    },

    showCurrentMenuItem: function(anchorLink) {
      var $allItems = $('.header__navigation__item');
      var $currentItem = $('.header__navigation [href*="#' + anchorLink + '"]').closest('.header__navigation__item');

      $allItems.removeClass('header__navigation__item--current');
      $currentItem.addClass('header__navigation__item--current');
    },

    initFullPage: function() {
      $('#fullpage').fullpage({
        sectionSelector: '.page-slide',
        easingcss3: 'ease-in-out',
        onLeave: ABET.HomePage.toggleSelectAndAppearance,
        afterLoad: ABET.HomePage.showCurrentMenuItem,
        keyboardScrolling: false,
        recordHistory: false
      });
    },

    destroyFullPage: function() {
      $.fn.fullpage.destroy('all');
    }
  },

  /**
   * Module for handling navigation interaction.
   */
  Navigation: {
    init: function() {
      ABET.Navigation.bindPageMapNavigation();
      ABET.Navigation.initStickySidebar();
    },

    bindHeaderNavigation: function() {
      var $links = $('.header__navigation .header__navigation__pages [href*="#"]');
      $links.on('click.smothScroll', function(event) {
        var anchor = $(this).attr('href').replace(/(.*)#(.*)/, '$2');
        var $anchor = $('[data-anchor="' + anchor + '"]');

        if ($anchor.length) {
          event.preventDefault();
          ABET.Navigation.smoothScroll($('[data-anchor="' + anchor + '"]'));
          $('.header').removeClass('header--open');
        }
      });
    },

    unbindHeaderNavigation: function() {
      var $links = $('.header__navigation .header__navigation__pages [href*="#"]');
      $links.off('click.smothScroll');
    },

    bindPageMapNavigation: function() {
      var $links = $('.page-map [href*="#"]');
      $links.on('click', function(event) {
        event.preventDefault();
        ABET.Navigation.smoothScroll($(this).attr('href'));
      });
    },

    smoothScroll: function(selector) {
      var $element = $(selector);
      var headerHeight = $('.header').outerHeight() + $('.header__page-title').outerHeight() + $('#wpadminbar').outerHeight() + 30;
      var offset = Math.abs($element.offset().top - $('body').scrollTop());
      var speed = Math.max(200, offset * 0.5);

      $('html, body').stop().animate({
        scrollTop: $element.length > 0 ? $element.offset().top - headerHeight : 0
      }, Math.min(speed, 300));
    },

    initStickySidebar: function() {
      var $sidebar = $('.split-content__half--page-map');
      var $pageMap = $('.split-content__half__body--floating', $sidebar);

      if ($sidebar.length === 0) {
        return;
      }

      ABET.$WINDOW.on('scroll', $.throttle(100, function() {
        var pageMapHeight = $pageMap.height();
        var hidingEdge = $sidebar.height();

        if (ABET.$WINDOW.scrollTop() + pageMapHeight >= hidingEdge) {
          $pageMap
            .css({
              'top': hidingEdge,
              'position': 'absolute'
            });
        } else {
          $pageMap
            .css({
              'top': 'auto',
              'position': 'fixed'
            });
        }
      }));
    }
  },

  /**
   * Module for handling tabs interaction.
   */
  ScheduleTabs: {
    init: function() {
      ABET.ScheduleTabs.bindSwitchingTabs();
    },

    bindSwitchingTabs: function() {
      $('.links-list[data-tabs]').each(function() {
        var $self = $(this);
        var $links = $self.find('.links-list__link');
        var $tabs = $($self.data('tabs') + ' .schedule-info__tabs__pane');

        if ($tabs.length === 0) {
          return;
        }

        $links.on('mouseover', function() {
          var $link = $(this);
          var $tab = $('#' + $link.data('tab'));

          $tabs.removeClass('schedule-info__tabs__pane--current');
          $tab.addClass('schedule-info__tabs__pane--current');

          $links.removeClass('links-list__link--current');
          $link.addClass('links-list__link--current');
        });
      });
    }
  },

  /**
   * Module for handling Speakers slider interaction.
   */
  Sliders: {
    init: function() {
      ABET.Sliders.initSliders();
    },

    initSliders: function() {
      $('.speakers-slider__slides__list').each(function() {
        var $slider = $(this);
        var $parent = $slider.closest('.speakers-slider');
        var $pager = $parent.find('.speakers-slider__header__pages');

        var calculatePager = function(currentIndex) {
          var allCount = 0;
          var currentCount = 0;
          var previousCount = 0;
          var $slides = $slider.find('> :not(.bx-clone)');

          $.each($slides, function(index) {
            var $slide = $(this);
            var count = $slide.children('article').length;

            if (index === currentIndex) {
              currentCount = count;
            }

            if (index === currentIndex - 1) {
              previousCount = count;
            }

            allCount += count;
          });

          if (allCount == $slides.length) {
            $pager.text((currentIndex + 1) + ' / ' + allCount);
          } else {
            $pager.text(
              ((currentIndex * previousCount) + 1) + '-' +
              ((currentIndex * previousCount) + currentCount) +
              ' / ' + allCount
            );
          }
        };

        var bxSlider = $slider.bxSlider({
          controls: false,
          pager: false,
          easing: 'ease-in-out',
          onSliderLoad: function(currentIndex) {
            calculatePager(currentIndex);
          },
          onSlideAfter: function($slideElement, oldIndex, newIndex) {
            calculatePager(newIndex);
          }
        });

        $('.speakers-slider__slides__prev', $parent).on('click', function() {
          bxSlider.goToPrevSlide();
        });
        $('.speakers-slider__slides__next', $parent).on('click', function() {
          bxSlider.goToNextSlide();
        });
      });
    }
  },

  /**
   * Module for handling interaction on Schedule page.
   */
  Schedule: {
    init: function() {
      ABET.Schedule.bindToggleDescription();
    },

    bindToggleDescription: function() {
      var $button = $('.event__about__toggle');

      $button.on('click', function(event) {
        event.preventDefault();
        $(this).closest('.event__about').toggleClass('event__about--open');
      });
    }
  },

  /**
   * Module for handling Page Map interaction.
   */
  PageMap: {
    $sidebars: $('.split-content__half__body--floating'),
    $mapLinks: $('.page-map [href*="#"]'),

    init: function() {
      if (ABET.PageMap.$sidebars.length === 0) {
        return;
      }

      ABET.PageMap.bindResize();
      ABET.PageMap.bindSelectCurrent();
    },

    bindResize: function() {
      ABET.$WINDOW
        .on('resize', $.throttle(100, function() {
          ABET.PageMap.$sidebars.each(function() {
            $(this).css('width', $(this).parent().width());
          });
        }))
        .trigger('resize');
    },

    bindSelectCurrent: function() {
      ABET.$WINDOW
        .on('scroll', $.throttle(100, function() {
          ABET.PageMap.$mapLinks.each(function() {
            var $self = $(this);
            var $element = $($(this).attr('href'));
            var scrollTop = ABET.$WINDOW.scrollTop();
            var elementTop = $element.offset().top;
            var elementDown = elementTop + $element.height();
            var windowHeight = ABET.$WINDOW.height();
            var windowHalf = scrollTop + windowHeight / 2;

            if (elementTop < windowHalf && elementDown > windowHalf) {
              $self.closest('.page-map__link').addClass('page-map__link--current');
            }

            if (elementTop > windowHalf || elementDown < windowHalf) {
              $self.closest('.page-map__link').removeClass('page-map__link--current');
            }
          });
        }))
        .trigger('scroll');
    }
  }

};

document.addEventListener('DOMContentLoaded', function() {
  ABET.init();
});
