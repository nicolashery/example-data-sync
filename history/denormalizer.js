var Immutable = require('immutable');
var lang = require('../lang');
var debug = require('debug')('app:history:denormalizer');

function eventsIn() {
  return [
    lang.TaskCreated,
    lang.TaskFileSet,
    lang.TaskStarted,
    lang.RawDataRejected,
    lang.RawDataValidated
  ];
}

function handler(store) {
  return function(event, cb) {
    cb = cb || function noop() {};
    var updates;
    if (event instanceof lang.TaskCreated) {
      debug('handle ' + event.get('eventType') + ' ' + event.get('eventId'));
      updates = Immutable.Map({
        status: 'pending',
        type: event.get('taskType'),
        userId: event.get('userId'),
        bucketId: event.get('bucketId'),
        meta: event.get('taskMeta')
      });
    } else if (event instanceof lang.TaskFileSet) {
      debug('handle ' + event.get('eventType') + ' ' + event.get('eventId'));
      updates = Immutable.Map({
        status: 'pending',
        meta: Immutable.Map({fileId: event.get('fileId')})
      });
    } else if (event instanceof lang.TaskStarted) {
      debug('handle ' + event.get('eventType') + ' ' + event.get('eventId'));
      updates = Immutable.Map({status: 'running'});
    } else if (event instanceof lang.RawDataRejected) {
      debug('handle ' + event.get('eventType') + ' ' + event.get('eventId'));
      updates = Immutable.Map({
        status: 'failed',
        reasonName: event.get('reasonName'),
        reasonMessage: event.get('reasonMessage')
      });
    } else if (event instanceof lang.RawDataValidated) {
      debug('handle ' + event.get('eventType') + ' ' + event.get('eventId'));
      updates = Immutable.Map({status: 'running'});
    } else if (event instanceof lang.RawDataParsed) {
      debug('handle ' + event.get('eventType') + ' ' + event.get('eventId'));
      updates = Immutable.Map({
        status: 'running',
        recordCount: event.get('recordCount')
      });
    } else if (event instanceof lang.DataRecordsIdentified) {
      debug('handle ' + event.get('eventType') + ' ' + event.get('eventId'));
      updates = Immutable.Map({status: 'running'});
    } else if (event instanceof lang.DataRecordsTranslated) {
      debug('handle ' + event.get('eventType') + ' ' + event.get('eventId'));
      updates = Immutable.Map({status: 'running'});
    } else if (event instanceof lang.TransformCompleted) {
      debug('handle ' + event.get('eventType') + ' ' + event.get('eventId'));
      updates = Immutable.Map({
        status: 'running',
        blobId: event.get('blobId')
      });
    }

    if (updates) {
      var taskId = taskId = event.get('taskId');
      var shortEvent = Immutable.Map({
        eventId: event.get('eventId'),
        eventType: event.get('eventType'),
        timestamp: event.get('timestamp')
      });
      store.updateTaskWithEvent(taskId, updates, shortEvent, function(err) {
        if (err) {
          debug('ERROR' + err);
          return cb(err);
        }
        cb();
      });
    } else {
      cb();
    }
  };
}

module.exports = {
  handler: handler,
  eventsIn: eventsIn
};
