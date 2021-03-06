
    describe('vaadin-month-calendar', function() {
      var monthCalendar;

      beforeEach(function(done) {
        monthCalendar = fixture('vaadin-month-calendar');

        // Need to internationalise the component with default values.
        monthCalendar.i18n = getDefaultI18n();
        monthCalendar.month = new Date(2016, 1, 1); // Feb 2016

        valueChangedSpy = sinon.spy();
        monthCalendar.addEventListener('selected-date-changed', valueChangedSpy);

        // Need to wait for the templates to be rendered.
        Polymer.Base.async(done);
      });

      // A helper for creating async test functions for 2016 month rendering.
      function createMonthTest(monthNumber) {
        var expectedDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return function(done) {
          monthCalendar.month = new Date(2016, monthNumber, 1);
          Polymer.Base.async(function() {
            var numberOfDays = monthCalendar.$.monthGrid.querySelectorAll('div:not(.weekday):not(:empty)').length;
            expect(numberOfDays).to.equal(expectedDays[monthNumber]);
            done();
          });
        };
      }

      // Create 12 tests for each month of 2016.
      for (var i = 0; i < 12; i++) {
        it('should render correct number of days for 2016/' + (i + 1), createMonthTest(i));
      }

      it('should render days in correct order by default', function() {
        var weekdays = monthCalendar.$.monthGrid.querySelectorAll('div.weekday');
        var weekdayTitles = Array.prototype.map.call(weekdays, function(weekday) {
          return weekday.textContent;
        });
        expect(weekdayTitles).to.eql(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
      });

      it('should render days in correct order by first day of week', function(done) {
        monthCalendar.set('i18n.firstDayOfWeek', 1); // Start from Monday.

        Polymer.Base.async(function() {
          var weekdays = monthCalendar.$.monthGrid.querySelectorAll('div.weekday');
          var weekdayTitles = Array.prototype.map.call(weekdays, function(weekday) {
            return weekday.textContent;
          });
          expect(weekdayTitles).to.eql(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
          done();
        });
      });

      it('should re-render after changing the month', function(done) {
        monthCalendar.month = new Date(2000, 0, 1); // Feb 2016 -> Jan 2000
        Polymer.Base.async(function() {
          var days = monthCalendar.$.monthGrid.querySelectorAll('div:not(.weekday):not(:empty)').length;
          expect(days).to.equal(31);
          expect(monthCalendar.$.title.textContent).to.equal('January 2000');
          done();
        });
      });

      it('should fire value change on tap', function() {
        var dateElements = monthCalendar.$.monthGrid.querySelectorAll('div:not(.weekday):not(:empty)');
        tap(dateElements[10]);
        expect(valueChangedSpy.calledOnce).to.be.true;
      });

      it('should fire date-tap on tap', function() {
        tapSpy = sinon.spy();
        monthCalendar.addEventListener('date-tap', tapSpy);
        var dateElements = monthCalendar.$.monthGrid.querySelectorAll('div:not(.weekday):not(:empty)');
        tap(dateElements[10]);
        expect(tapSpy.calledOnce).to.be.true;
        tap(dateElements[10]);
        expect(tapSpy.calledTwice).to.be.true;
      });

      it('should not fire value change on tapping an empty cell', function() {
        var emptyDateElement = monthCalendar.$.monthGrid.querySelector('div:not(.weekday):empty');
        tap(emptyDateElement);
        expect(valueChangedSpy.called).to.be.false;
      });

      it('should update value on tap', function() {
        var dateElements = monthCalendar.$.monthGrid.querySelectorAll('div:not(.weekday):not(:empty)');
        for (var i = 0; i < dateElements.length; i++) {
          if (dateElements[i].date.getDate() === 10) {
            // Tenth of February.
            tap(dateElements[i]);
          }
        }
        expect(monthCalendar.selectedDate.getFullYear()).to.equal(2016);
        expect(monthCalendar.selectedDate.getMonth()).to.equal(1);
        expect(monthCalendar.selectedDate.getDate()).to.equal(10);
      });

      it('should not react if the tap takes more than 300ms', function(done) {
        tapSpy = sinon.spy();
        monthCalendar.addEventListener('date-tap', tapSpy);
        var dateElement = monthCalendar.$.monthGrid.querySelectorAll('div:not(.weekday):not(:empty)')[10];

        monthCalendar._onMonthGridTouchStart();
        monthCalendar.async(function() {
          tap(dateElement);
          expect(tapSpy.called).to.be.false;
          done();
        }, 350);
      });

      it('should not react if ignoreTaps is on', function() {
        tapSpy = sinon.spy();
        monthCalendar.addEventListener('date-tap', tapSpy);
        monthCalendar.ignoreTaps = true;
        var dateElement = monthCalendar.$.monthGrid.querySelectorAll('div:not(.weekday):not(:empty)')[10];
        tap(dateElement);
        expect(tapSpy.called).to.be.false;
      });

      it('should prevent default on touchend', function() {
        var preventDefaultSpy = sinon.spy();
        var touchendEvent = new CustomEvent('touchend', {
          bubbles: true,
          cancelable: true
        });
        touchendEvent.changedTouches = [{}];
        touchendEvent.preventDefault = preventDefaultSpy;

        // Dispatch a fake touchend event from a date element.
        var dateElement = monthCalendar.$.monthGrid.querySelector('div:not(.weekday):not(:empty)');
        dateElement.dispatchEvent(touchendEvent);
        expect(preventDefaultSpy).to.have.been.called;
      });

      it('should work with sub 100 years', function(done) {
        var month = new Date(0, 0);
        month.setFullYear(99);
        monthCalendar.month = month;
        monthCalendar.async(function() {
          var date = monthCalendar.$.monthGrid.querySelector('div:not(.weekday):not(:empty)').date;
          expect(date.getFullYear()).to.equal(month.getFullYear());
          done();
        });
      });

      it('should not update value on disabled date tap', function(done) {

        monthCalendar.maxDate = new Date('2016-02-09');

        Polymer.Base.async(function() {
          var dateElements = monthCalendar.$.monthGrid.querySelectorAll('div:not(.weekday):not(:empty)');
          for (var i = 0; i < dateElements.length; i++) {
            if (dateElements[i].date.getDate() === 10) {
              // Tenth of February.
              tap(dateElements[i]);
            }
          }
          expect(monthCalendar.selectedDate).to.be.undefined;
          done();
        });
      });

      describe('i18n', function() {
        beforeEach(function(done) {
          monthCalendar.i18n = {
            monthNames:
              'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kes??kuu_hein??kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
            weekdays: 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
            weekdaysShort: 'su_ma_ti_ke_to_pe_la'.split('_'),
            firstDayOfWeek: 1,
            week: 'viikko',
            today: 'T??n????n',
            formatTitle: function(monthName, fullYear) {
              return monthName + '-' + fullYear;
            }
          };
          Polymer.Base.async(done);
        });

        it('should render weekdays in correct locale', function() {
          var weekdays = monthCalendar.$.monthGrid.querySelectorAll('div.weekday');
          var weekdayLabels = Array.prototype.map.call(weekdays, function(weekday) {
            return weekday.getAttribute('aria-label');
          });
          var weekdayTitles = Array.prototype.map.call(weekdays, function(weekday) {
            return weekday.textContent;
          });
          expect(weekdayLabels).to.eql(['maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai']);
          expect(weekdayTitles).to.eql(['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su']);
        });

        it('should label dates in correct locale', function() {
          var dates = monthCalendar.$.monthGrid.querySelectorAll('div:not(.weekday):not(:empty)');
          Array.prototype.slice.call(dates, 0, 7).map(function(date, index) {
            var label = date.getAttribute('aria-label');
            expect(label).to.equal((index + 1) + ' helmikuu 2016, ' + [
              'maanantai', 'tiistai', 'keskiviikko', 'torstai',
              'perjantai', 'lauantai', 'sunnuntai'
            ][index]);
          });
        });

        it('should label today in correct locale', function(done) {
          monthCalendar.month = new Date();
          Polymer.Base.async(function() {
            var today = monthCalendar.$.monthGrid.querySelector('div:not(.weekday):not(:empty)[today]');
            expect(today.getAttribute('aria-label').split(', ').pop()).to.equal('T??n????n');
            done();
          });
        });

        it('should render month name in correct locale', function() {
          expect(monthCalendar.$.title.textContent).to.equal('helmikuu-2016');
        });

        it('should label week numbers in correct locale', function(done) {
          monthCalendar.showWeekNumbers = 1;
          monthCalendar.month = new Date(2016, 1, 1);

          monthCalendar.async(function() {
            var weekNumberElements = Polymer.dom(monthCalendar.$.monthGrid).querySelectorAll('.weeknumber');
            expect(weekNumberElements[0].getAttribute('aria-label')).to.equal('viikko 5');
            expect(weekNumberElements[1].getAttribute('aria-label')).to.equal('viikko 6');
            done();
          });
        });
      });

      describe('Week Numbers', function() {
        beforeEach(function() {
          monthCalendar.showWeekNumbers = true;
          monthCalendar.set('i18n.firstDayOfWeek', 1);
        });

        function getWeekNumbers(cal) {
          return Polymer.dom(cal.$.monthGrid).querySelectorAll('.weeknumber').map(function(elem) {
            return parseInt(elem.textContent, 10);
          });
        }

        it('should render correct week numbers for Jan 2016', function(done) {
          var month = new Date(2016, 0, 1);
          monthCalendar.month = month;

          monthCalendar.async(function() {
            var weekNumbers = getWeekNumbers(monthCalendar);
            expect(weekNumbers).to.eql([53, 1, 2, 3, 4]);
            done();
          });
        });

        it('should render correct week numbers for Dec 2015', function(done) {
          var month = new Date(2015, 11, 1);
          monthCalendar.month = month;

          monthCalendar.async(function() {
            var weekNumbers = getWeekNumbers(monthCalendar);
            expect(weekNumbers).to.eql([49, 50, 51, 52, 53]);
            done();
          });
        });

        it('should render correct week numbers for Feb 2016', function(done) {
          var month = new Date(2016, 1, 1);
          monthCalendar.month = month;

          monthCalendar.async(function() {
            var weekNumbers = getWeekNumbers(monthCalendar);
            expect(weekNumbers).to.eql([5, 6, 7, 8, 9]);
            done();
          });
        });

        it('should render correct week numbers for May 99', function(done) {
          var month = new Date(0, 4, 1);
          month.setFullYear(99);

          monthCalendar.month = month;

          monthCalendar.async(function() {
            var weekNumbers = getWeekNumbers(monthCalendar);
            expect(weekNumbers).to.eql([18, 19, 20, 21, 22]);
            done();
          });
        });
      });

    });
  