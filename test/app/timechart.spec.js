'use strict';

let OutriggerTester = require('./lib/outrigger-tester');
let path = require('path');
let expect = require('chai').expect;

const TEST_TIMEOUT = 10000;

describe('barchart', function() {
    this.timeout(TEST_TIMEOUT);
    let outriggerTester;

    before((done) => {
        outriggerTester = new OutriggerTester();
        outriggerTester.start(done);
    });

    after(() => {
        outriggerTester.stop();
    });

    it('can render a simple timechart', () => {
        var title = '% CPU usage per host';
        return outriggerTester.run({
            path: path.join(__dirname, 'juttle', 'simple_timechart.juttle')
        })
        .then(() => {
            return outriggerTester.waitForViewTitle(title);
        })
        .then(() => {
            return outriggerTester.getSeriesOnViewWithTitle(title)
        })
        .then((seriesElements) => {
            expect(seriesElements.length).to.be.equal(3);
            var seriesIdsFound = [];
            return Promise.each(seriesElements, function(series) {
                return series.getAttribute('id')
                .then(function(id) {
                    seriesIdsFound.push(id);
                });
            })
            .then(function() {
                expect(seriesIdsFound).to.have.members([
                    'nyc.2', 'sea.0', 'sjc.1'
                ]);
            });
        })
        .then(() => {
            return outriggerTester.waitForYAxisTitleOnViewWithTitle(title, '% CPU busy');
        })
        .then(() => {
            return outriggerTester.waitForXAxisTitleOnViewWithTitle(title, 'hostname');
        });
    });
    
    // revive test once we fix: https://github.com/juttle/juttle-viz/issues/4
    it.skip('can render an overlayed timechart', () => {
        var title = '% CPU usage per host per day';
        return outriggerTester.run({
            path: path.join(__dirname, 'juttle', 'overlayed_timechart.juttle')
        })
        .then(() => {
            return outriggerTester.waitForViewTitle(title);
        })
        .then(() => {
            return outriggerTester.getSeriesOnViewWithTitle(title)
        })
        .then((seriesElements) => {
            expect(seriesElements.length).to.be.equal(3);
            var seriesIdsFound = [];
            return Promise.each(seriesElements, function(series) {
                return series.getAttribute('id')
                .then(function(id) {
                    seriesIdsFound.push(id);
                });
            })
            .then(function() {
                expect(seriesIdsFound).to.have.members([
                    'nyc.2', 'sea.0', 'sjc.1'
                ]);
            });
        })
        .then(() => {
            return outriggerTester.waitForYAxisTitleOnViewWithTitle(title, '% CPU busy');
        })
        .then(() => {
            return outriggerTester.waitForXAxisTitleOnViewWithTitle(title, 'hostname');
        });
    });

});
