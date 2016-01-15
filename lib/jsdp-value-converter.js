var JuttleMoment = require("juttle/lib/moment").JuttleMoment;
var moment = require("moment");
var _ = require("underscore");

var dateConverter = {
    isConvertibleToJSDPValue: function(value) {
        return value instanceof JuttleMoment && value.moment;
    },
    isConvertibleToJuttleValue: function(value) {
        return _.isDate(value);
    },
    convertToJSDPValue: function(value) {
        return value.moment.toDate();
    },
    convertToJuttleValue: function(value) {
        return new JuttleMoment({ rawDate: value });
    }
};

var durationConverter = {
    isConvertibleToJSDPValue: function(value) {
        return value instanceof JuttleMoment && value.duration;
    },
    isConvertibleToJuttleValue: function(value) {
        return moment.isDuration(value);
    },
    convertToJSDPValue: function(value) {
        return moment.duration(value.duration.toJSON());
    },
    convertToJuttleValue: function(value) {
        return new JuttleMoment({rawDurationString: value.toJSON()});
    }
};

var converters = [dateConverter, durationConverter];

function getToJSDPValueConverter(value) {
    return _.find(converters, function(converter) {
        return converter.isConvertibleToJSDPValue(value);
    });
}

function getToJuttleValueConverter(value) {
    return _.find(converters, function(converter) {
        return converter.isConvertibleToJuttleValue(value);
    });
}

function convertToJSDPValue(value) {
    var converter = getToJSDPValueConverter(value);

    if (converter) {
        return converter.convertToJSDPValue(value);
    }
    else if (_.isArray(value)) {
        return value.map(function (item) {
            return convertToJSDPValue(item);
        });
    }
    else if (_.isObject(value)) {
        return _.mapObject(value, function(item) {
            return convertToJSDPValue(item);
        });
    }
    else {
        return value;
    }
}

function convertToJuttleValue(value) {
    var converter = getToJuttleValueConverter(value);

    if (converter) {
        return converter.convertToJuttleValue(value);
    }
    else if (_.isArray(value)) {
        return value.map(function (item) {
            return convertToJuttleValue(item);
        });
    }
    else if (_.isObject(value)) {
        return _.mapObject(value, function(item) {
            return convertToJuttleValue(item);
        });
    }
    else {
        return value;
    }
}

module.exports = {
    convertToJuttleValue: convertToJuttleValue,
    convertToJSDPValue: convertToJSDPValue
};
