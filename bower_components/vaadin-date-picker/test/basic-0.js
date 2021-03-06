
    describe('Basic features', function() {
      var datepicker;

      beforeEach(function() {
        datepicker = fixture('datepicker');
      });

      afterEach(function(done) {
        datepicker.async(done, 1);
      });

      it('should have default value', function() {
        expect(datepicker.value).to.equal('');
      });

      it('should notify value change', function() {
        var spy = sinon.spy();
        datepicker.addEventListener('value-changed', spy);
        datepicker.value = '2000-02-01';
        expect(spy.calledOnce).to.be.true;
      });

      it('should open with open call', function(done) {
        open(datepicker, function() {
          done();
        });
      });

      it('should notify opened changed on open', function(done) {
        open(datepicker, function() {
          expect(datepicker.opened).to.be.true;
          done();
        });
      });

      it('should notify opened changed on close', function(done) {
        open(datepicker, function() {
          listenForEvent(datepicker, 'opened-changed', function() {
            expect(datepicker.opened).to.be.false;
            done();
          });
          datepicker.close();
        });
      });

      it('should close with close call', function(done) {
        open(datepicker, function() {
          close(datepicker, function() {
            expect(datepicker.opened).to.be.false;
            done();
          });
        });
      });

      it('should open on input tap', function(done) {
        listenForEvent(datepicker, 'iron-overlay-opened', done);
        tap(datepicker.$.input);
      });

      it('should open on label tap', function(done) {
        listenForEvent(datepicker, 'iron-overlay-opened', done);
        tap(datepicker.$.input);
      });

      it('should pass the placeholder attribute to the input tag', function() {
        var placeholder = 'Pick a date';
        datepicker.set('placeholder', placeholder);
        expect(datepicker.$.input.placeholder).to.be.equal(placeholder);
      });

      // label and placeholder will go on top of each other if always-float-label isn't set
      // This is the similar behavior as paper-input has:
      // PolymerElements/paper-input/blob/d248dad17af3ee46a0701a664e0f304c1619770d/paper-input-behavior.html#L502
      it('should set always-float-label when placeholder is provided', function() {
        expect(datepicker.$.inputcontainer.alwaysFloatLabel).to.be.false;
        datepicker.set('placeholder', 'Pick a date');
        expect(datepicker.$.inputcontainer.alwaysFloatLabel).to.be.true;
      });

      it('should scroll to today by default', function(done) {
        var spy = sinon.spy(datepicker.$.overlay, 'scrollToDate');
        open(datepicker, function() {
          expect(monthsEqual(spy.firstCall.args[0], new Date())).to.be.true;
          done();
        });
      });

      it('should scroll to initial position', function(done) {
        datepicker.initialPosition = '2016-01-01';
        var initialPositionDate = new Date(2016, 0, 1);

        var spy = sinon.spy(datepicker.$.overlay, 'scrollToDate');
        open(datepicker, function() {
          expect(spy.firstCall.args[0]).to.eql(initialPositionDate);
          done();
        });
      });

      it('should remember the original initial position on reopen', function(done) {
        datepicker.initialPosition = null;
        var initialPosition;

        datepicker.addEventListener('iron-overlay-opened', function() {
          if (initialPosition) {
            expect(datepicker.$.overlay.initialPosition).to.eql(initialPosition);
            done();
          } else {
            initialPosition = datepicker.$.overlay.initialPosition;
            datepicker.close();
            datepicker.open();
          }
        });
        datepicker.open();
      });

      it('should scroll to selected value by default', function(done) {
        var spy = sinon.spy(datepicker.$.overlay, 'scrollToDate');
        datepicker.value = '2000-02-01';
        open(datepicker, function() {
          expect(monthsEqual(spy.firstCall.args[0], new Date(2000, 1, 1))).to.be.true;
          done();
        });
      });

      it('should close on overlay date tap', function(done) {
        listenForEvent(datepicker, 'iron-overlay-closed', done);

        open(datepicker, function() {
          Polymer.Base.fire('date-tap', {}, {
            bubbles: true,
            node: datepicker.$.overlay
          });
        });
      });

      it('should not have label defined by default', function() {
        expect(datepicker.label).to.be.undefined;
      });

      it('label should be bound to label element', function() {
        datepicker.label = 'This is LABEL';
        expect(datepicker.$.label.innerHTML).to.eql('This is LABEL');
      });

      it('should clear the value', function() {
        datepicker.value = '2000-02-01';
        tap(datepicker.$.clear);
        expect(datepicker.value).to.equal('');
      });

      it('should format display correctly', function() {
        datepicker.value = '2000-02-01';
        expect(datepicker.$.input.bindValue).to.equal('2/1/2000');
        datepicker.value = '1999-12-31';
        expect(datepicker.$.input.bindValue).to.equal('12/31/1999');
      });

      it('should format display correctly with sub 100 years', function() {
        datepicker.value = '+000001-02-01';
        expect(datepicker.$.input.bindValue).to.equal('2/1/0001');
        datepicker.value = '+000099-02-01';
        expect(datepicker.$.input.bindValue).to.equal('2/1/0099');
      });

      it('should not show clear icon', function() {
        datepicker.open();
        datepicker.value = '2000-02-01';
        expect(datepicker.$.clear.clientHeight).not.equal(0);
        datepicker.value = '';
        expect(datepicker.$.clear.clientHeight).to.equal(0);
      });

      it('should show clear icon', function(done) {
        datepicker.value = '2000-02-01';
        Polymer.Base.fire('date-tap', {}, {
          bubbles: true,
          node: datepicker.$.overlay
        });

        open(datepicker, function() {
          if (isFullscreen(datepicker)) {
            expect(datepicker.$.overlay.$.clear.clientHeight).not.to.equal(0);
          } else {
            expect(datepicker.$.clear.clientHeight).not.to.equal(0);
          }
          done();
        });
      });

      it('should open by tapping the calendar icon', function(done) {
        listenForEvent(datepicker, 'iron-overlay-opened', done);
        tap(datepicker.$.calendar);
      });

      it('should scroll to a date on open', function(done) {
        // We must scroll to a date on every open because at least IE11 seems to reset
        // scrollTop while the dropdown is closed. This will result in all kind of problems.
        var spy = sinon.spy(datepicker.$.overlay, 'scrollToDate');

        open(datepicker, function() {
          expect(spy.called).to.be.true;

          spy.reset();
          close(datepicker, function() {

            open(datepicker, function() {
              expect(spy.called).to.be.true;
              done();
            });
          });
          datepicker.close();
        });
      });

      it('should not change datepicker width', function() {
        datepicker.style.display = 'inline-block';

        datepicker.value = '2000-01-01';
        var width = datepicker.clientWidth;

        datepicker.open();
        expect(datepicker.clientWidth).to.equal(width);
      });

      it('should not auto focus overlay', function() {
        expect(datepicker.$.dropdown.noAutoFocus).to.equal(true);
      });

      it('should realign on iron-resize', function(done) {
        open(datepicker, function() {
          sinon.stub(datepicker, '_updateAlignmentAndPosition', function() {
            if (!done._called) {
              done._called = true;
              done();
            }
          });
          datepicker.fire('iron-resize', undefined, {bubbles: false});
        });
      });

      describe('window scroll realign', function() {

        beforeEach(function(done) {
          open(datepicker, done);
        });

        it('should realign on window scroll', function(done) {
          sinon.stub(datepicker, '_updateAlignmentAndPosition', function() {
            if (!done._called) {
              done._called = true;
              done();
            }
          });
          Polymer.Base.fire('scroll', {}, {
            node: window
          });
        });

        it('should realign on container scroll', function(done) {
          datepicker.close();

          var container = fixture('datepicker-wrapped');
          var datepickerWrapped = container.querySelector('vaadin-date-picker');

          open(datepickerWrapped, function() {
            sinon.stub(datepickerWrapped, '_updateAlignmentAndPosition', function() {
              if (!done._called) {
                done._called = true;
                done();
              }
            });
            container.scrollTop += 100;
          });
        });

        if (!ios) { // https://github.com/vaadin/vaadin-date-picker/issues/330
          it('should not realign on year/month scroll', function(done) {
            var spy = sinon.spy(datepicker, '_updateAlignmentAndPosition');
            datepicker.$.overlay.$.yearScroller.$.scroller.scrollTop += 100;
            datepicker.async(function() {
              expect(spy.called).to.be.false;
              done();
            }, 1);
          });
        }

        it('should not realign once closed', function(done) {
          datepicker.addEventListener('iron-overlay-closed', function() {
            var spy = sinon.spy(datepicker, '_updateAlignmentAndPosition');
            Polymer.Base.fire('scroll', {}, {
              node: window
            });
            datepicker.async(function() {
              expect(spy.called).to.be.false;
              done();
            }, 1);
          });
          datepicker.close();
        });

      });

      describe('value property formats', function() {

        it('should accept ISO format', function() {
          var date = new Date(0, 1, 3);

          datepicker.value = '0000-02-03';
          date.setFullYear(0);
          expect(datepicker._selectedDate).to.eql(date);

          datepicker.value = '+010000-02-03';
          date.setFullYear(10000);
          expect(datepicker._selectedDate).to.eql(date);

          datepicker.value = '-010000-02-03';
          date.setFullYear(-10000);
          expect(datepicker._selectedDate).to.eql(date);
        });

        it('should not accept non-ISO formats', function() {
          datepicker.value = '03/02/01';
          expect(datepicker.value).to.equal('');
          expect(datepicker._selectedDate).to.equal('');

          datepicker.value = '2010/02/03';
          expect(datepicker.value).to.equal('');
          expect(datepicker._selectedDate).to.equal('');

          datepicker.value = '03/02/2010';
          expect(datepicker.value).to.equal('');
          expect(datepicker._selectedDate).to.equal('');

          datepicker.value = '3 Feb 2010';
          expect(datepicker.value).to.equal('');
          expect(datepicker._selectedDate).to.equal('');

          datepicker.value = 'Feb 3, 2010';
          expect(datepicker.value).to.equal('');
          expect(datepicker._selectedDate).to.equal('');
        });

        it('should output ISO format', function() {
          var date = new Date(0, 1, 3);

          date.setFullYear(0);
          datepicker._selectedDate = date;
          expect(datepicker.value).to.equal('0000-02-03');

          date.setFullYear(10000);
          datepicker._selectedDate = new Date(date.getTime());
          expect(datepicker.value).to.equal('+010000-02-03');

          date.setFullYear(-10000);
          datepicker._selectedDate = new Date(date.getTime());
          expect(datepicker.value).to.equal('-010000-02-03');
        });

      });
      describe('i18n', function() {
        beforeEach(function(done) {
          datepicker.set('i18n.weekdays', 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'));
          datepicker.set('i18n.weekdaysShort', 'su_ma_ti_ke_to_pe_la'.split('_'));
          datepicker.set('i18n.firstDayOfWeek', 1);
          datepicker.set('i18n.formatDate', function(d) {
            if (d) {
              return [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('.');
            }
          });
          datepicker.set('i18n.calendar', 'Kalenteri');
          datepicker.set('i18n.clear', 'Tyhjenn??');
          datepicker.set('i18n.today', 'T??n????n');
          datepicker.set('i18n.cancel', 'Peruuta');

          open(datepicker, function() {
            Polymer.RenderStatus.afterNextRender(datepicker.$.overlay.$.scroller, function() {
              Polymer.Base.async(function() {
                done();
              }, 1);
            });
          });

        });

        it('should notify i18n mutation to children', function() {
          var monthCalendar = datepicker.$.overlay.$.scroller.$.scroller.querySelector('vaadin-month-calendar');
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

        it('should reflect value in overlay label', function() {
          datepicker.value = '2000-02-01';
          expect(datepicker.$.overlay.$.input.value).to.equal('1.2.2000');
        });

        it('should display buttons in correct locale', function() {
          expect(datepicker.$.calendar.getAttribute('aria-label').trim()).to.equal('Kalenteri');
          expect(datepicker.$.clear.getAttribute('aria-label').trim()).to.equal('Tyhjenn??');
          expect(datepicker.$.overlay.$.todayButton.textContent.trim()).to.equal('T??n????n');
          expect(datepicker.$.overlay.$.cancelButton.textContent.trim()).to.equal('Peruuta');
        });

        it('should translate the overlay title', function() {
          expect(datepicker.$.overlay.$.announcer.textContent.trim()).to.equal('Kalenteri');
        });
      });

      describe('Disabled', function() {

        beforeEach(function() {
          datepicker.disabled = true;
        });

        it('dropdown should not open', function() {
          datepicker.open();
          expect(datepicker.$.dropdown.opened).to.be.equal(false);
        });

        it('calendar icon should be hidden', function() {
          expect(datepicker.$.calendar.clientHeight).to.equal(0);
        });

        it('clear icon should be hidden', function() {
          expect(datepicker.$.clear.clientHeight).to.equal(0);
          datepicker.open();
          expect(datepicker.$.clear.clientHeight).to.equal(0);
        });
      });

      describe('Readonly', function() {

        beforeEach(function() {
          datepicker.readonly = true;
        });

        it('dropdown should not open', function() {
          datepicker.open();
          expect(datepicker.$.dropdown.opened).to.be.equal(false);
        });

        it('calendar icon should be hidden', function() {
          expect(datepicker.$.calendar.clientHeight).to.equal(0);
        });

        it('clear icon should be hidden', function() {
          expect(datepicker.$.clear.clientHeight).to.equal(0);
          datepicker.open();
          expect(datepicker.$.clear.clientHeight).to.equal(0);
        });

        it('should be focusable', function() {
          expect(datepicker.$.input.tabIndex).to.equal(0);
        });
      });

      describe('Date limits', function() {

        beforeEach(function() {
          datepicker.min = '2016-01-01';
          datepicker.max = '2016-12-31';
        });

        it('should be invalid when value is out of limits', function() {
          datepicker.value = '2017-01-01';
          expect(datepicker.invalid).to.be.equal(true);
        });

        it('should be valid when value is inside the limits', function() {
          datepicker.value = '2016-07-14';
          expect(datepicker.invalid).to.be.equal(false);
        });

        it('should be valid when value is the same as min date', function() {
          datepicker.value = '2016-01-01';
          expect(datepicker.invalid).to.be.equal(false);
        });

        it('should be valid when value is the same as max date', function() {
          datepicker.value = '2016-12-31';
          expect(datepicker.invalid).to.be.equal(false);
        });

        it('should scroll to min date when today is not allowed', function(done) {
          datepicker.max = null;
          datepicker.min = '2100-01-01';
          var minDate = new Date(2100, 0, 1);

          var spy = sinon.spy(datepicker.$.overlay, 'scrollToDate');
          datepicker.addEventListener('iron-overlay-opened', function() {
            expect(spy.firstCall.args[0]).to.eql(minDate);
            done();
          });
          datepicker.open();
        });

        it('should scroll to max date when today is not allowed', function(done) {
          datepicker.min = null;
          datepicker.max = '2000-01-01';
          var maxDate = new Date(2000, 0, 1);

          var spy = sinon.spy(datepicker.$.overlay, 'scrollToDate');
          datepicker.addEventListener('iron-overlay-opened', function() {
            expect(spy.firstCall.args[0]).to.eql(maxDate);
            done();
          });
          datepicker.open();
        });

        it('should scroll to initial position even when not allowed', function(done) {
          datepicker.initialPosition = '2015-01-01';
          var initialPositionDate = new Date(2015, 0, 1);

          var spy = sinon.spy(datepicker.$.overlay, 'scrollToDate');
          datepicker.addEventListener('iron-overlay-opened', function() {
            expect(spy.firstCall.args[0]).to.eql(initialPositionDate);
            done();
          });
          datepicker.open();
        });
      });

    });
  