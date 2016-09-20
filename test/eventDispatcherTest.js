var expect = require('expect.js'),
  EventDispatcher = require('../lib/eventDispatcher');

describe('EventDispatcher', function () {

  describe('creating an instance', function () {

    describe('without passing a publisher function', function () {
      
      describe('and calling start', function () {

        it('it should callback with an error', function (done) {

          var eventDispatcher = new EventDispatcher();
          eventDispatcher.start(function(err) {
            expect(err).to.be.ok();
            expect(err.message).to.match(/publisher/);
            done();
          });

        });
        
      });

    });

    describe('without passing a store', function () {

      describe('and calling start', function () {

        it('it should callback with an error', function (done) {

          var eventDispatcher = new EventDispatcher(function () {}, { getUndispatchedEvents: function () {} });
          expect(eventDispatcher.undispatchedEventsQueue.length).to.eql(0);
          eventDispatcher.start(function(err) {
            expect(err).to.be.ok();
            expect(err.message).to.match(/store/);
            done();
          });

        });

      });

    });

  });

  describe('starting it', function () {

    describe('while having some undispatched events in the store', function () {

      it('it should publish that events', function (done) {
        
        var eventsInStore = [{
          payload: {
            one: 'event1'
          }
        }, {
          payload: {
            two: 'event2'
          }
        }];

        function getUndispatchedEvents (callback) {
          callback(null, eventsInStore);
        }
        
        var publishedEvents = [];
        
        function publisher (evt) {
          publishedEvents.push(evt);
          check();
        }
        
        function check () {
          if (publishedEvents.length === 2) {
            expect(publishedEvents[0]).to.eql(eventsInStore[0].payload);
            expect(publishedEvents[1]).to.eql(eventsInStore[1].payload);
            done();
          }
        }

        var eventDispatcher = new EventDispatcher(publisher, {
                                    getUndispatchedEvents: getUndispatchedEvents,
                                    setEventToDispatched: function (evt, callback) { callback(null); }});
        expect(eventDispatcher.undispatchedEventsQueue.length).to.eql(0);
        
        eventDispatcher.start(function(err) {
          expect(err).not.to.be.ok();
        });

      });

      it('should not crash when there are lots of pending events', function (done) {
        
        var eventsInStore = [];

        for(var i = 0; i < 10000; i++){
          eventsInStore.push({
            payload: {
              index: i
            }
          });
        }

        function getUndispatchedEvents (callback) {
          callback(null, eventsInStore);
        }
        
        var publishedEvents = [];
        
        function publisher (evt) {
          publishedEvents.push(evt);
          check();
        }
        
        function check () {
          if (publishedEvents.length === eventsInStore.length) {
            done();
          }
        }

        var eventDispatcher = new EventDispatcher(publisher, {
                                    getUndispatchedEvents: getUndispatchedEvents,
                                    setEventToDispatched: function (evt, callback) { callback(null); }});
        expect(eventDispatcher.undispatchedEventsQueue.length).to.eql(0);
        
        eventDispatcher.start(function(err) {
          expect(err).not.to.be.ok();
        });

      });

    });

    describe('and calling addUndispatchedEvents', function () {

      it('it should publish that events', function (done) {

        var eventsInStore = [];

        var eventsToBePublished = [{
          payload: {
            one: 'event1'
          }
        }, {
          payload: {
            two: 'event2'
          }
        }];

        function getUndispatchedEvents (callback) {
          callback(null, eventsInStore);
        }

        var publishedEvents = [];

        function publisher (evt) {
          publishedEvents.push(evt);
          check();
        }

        function check () {
          if (publishedEvents.length === 2) {
            expect(publishedEvents[0]).to.eql(eventsToBePublished[0].payload);
            expect(publishedEvents[1]).to.eql(eventsToBePublished[1].payload);
            done();
          }
        }

        var eventDispatcher = new EventDispatcher(publisher, {
          getUndispatchedEvents: getUndispatchedEvents,
          setEventToDispatched: function (evt, callback) { callback(null); }});
        expect(eventDispatcher.undispatchedEventsQueue.length).to.eql(0);

        eventDispatcher.start(function(err) {
          expect(err).not.to.be.ok();
        });
        
        eventDispatcher.addUndispatchedEvents(eventsToBePublished);

      });

    });

  });

});
