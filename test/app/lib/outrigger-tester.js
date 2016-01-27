'use strict';

let _ = require('underscore');
let expect = require('chai').expect;
let Promise = require('bluebird');
let retry = require('bluebird-retry');

let webdriver = require('selenium-webdriver');
let By = webdriver.By;
let until = webdriver.until;

let nconf = require('nconf');
nconf.argv().env();

// setup log level to be quiet by default
let logSetup = require('../../../bin/log-setup');
logSetup.init({
    // set LOGLEVEL=OFF to quiet all logging
    'log-level': nconf.get('LOGLEVEL') || 'INFO'
});

if (!nconf.get('SELENIUM_BROWSER')) {
    // default to chrome
    process.env['SELENIUM_BROWSER'] = 'chrome';
}

let JuttledService = require('../../../lib/service-juttled');

const OUTRIGGER_PORT = 2000;

class OutriggerTester {
    start(cb) {
        this.outrigger = new JuttledService({
            port: OUTRIGGER_PORT,
            root_directory: '/'
        }, cb);

        this.driver = new webdriver.Builder()
            .build();
    }

    stop() {
        if (!nconf.get('KEEP_BROWSER')) {
            this.driver.quit();
        }

        this.outrigger.stop();
    }

    _findElement(locator) {
        /*
         * find an element by using a By.*** locator and return it only
         * after its been found and is visible
         *
         */
        return this.driver.wait(until.elementLocated(locator))
        .then(() => {
            return this.driver.findElement(locator)
            .then((element) => {
                return this.driver.wait(until.elementIsVisible(element))
                .then(() => {
                    return element;
                });
            });
        });
    }

    clickPlay() {
        var locator = By.id('btn-run');
        return this._findElement(locator)
        .then((button) => {
            return button.click();
        });
    }

    findInputControl(inputControlLabel) {
        var locator = By.css(`.inputs-view div[data-input-label=${inputControlLabel}] input`);
        return this._findElement(locator);
    }

    getInputControlValue(inputControlLabel) {
        return this.findInputControl(inputControlLabel)
        .then((element) => {
            return element.getAttribute('value');
        });
    }

    writeIntoInputControl(inputControlLabel, text) {
        var self = this;

        return retry(() => {
            return this.findInputControl(inputControlLabel)
            .then((inputElement) => {
                inputElement.clear();

                _.each(text, (key) => {
                    inputElement.sendKeys(key);
                });

                return self.getInputControlValue(inputControlLabel)
                .then((value) => {
                    expect(value).to.equal(text);
                });
            });
        });
    }

    findViewByTitle(title) {
        var locator = By.xpath(`//div[@class='jut-chart-title' and text()='${title}']/ancestor::div[contains(@class,'juttle-view')]`);
        return this._findElement(locator);
    }

    waitForViewTitle(title) {
        return this.findViewByTitle(title);
    }

    getErrorMessage() {
        var locator = By.css('.juttle-client-library.error-view span');
        return this._findElement(locator)
        .then((element) => {
            return element.getAttribute('textContent');
        });
    }

    waitForJuttleErrorToContain(message, options) {
        var self = this;
        var defaults = {
            interval: 1000,
            timeout: 10000
        };
        options = _.extend(defaults, options);

        return retry(() => {
            return self.getErrorMessage()
            .then((value) => {
                expect(value).to.contain(message);
            });
        }, options);
    }

    waitForJuttleErrorToEqual(message, options) {
        var self = this;
        var defaults = {
            interval: 1000,
            timeout: 10000
        };
        options = _.extend(defaults, options);

        return retry(() => {
            return self.getErrorMessage()
            .then((value) => {
                expect(value).to.equal(message);
            });
        }, options);
    }

    getTextOutput(title) {
        return this.findViewByTitle(title)
        .then((element) => {
            return element.findElement(By.css('textarea'));
        })
        .then((elem) => {
            return elem.getAttribute('value');
        });
    }

    waitForTextOutputToContain(title, data, options) {
        var self = this;

        var defaults = {
            interval: 1000,
            timeout: 10000
        };
        options = _.extend(defaults, options);

        return retry(() => {
            return self.getTextOutput(title)
            .then((value) => {
                expect(JSON.parse(value)).to.deep.equal(data);
            });
        }, options);
    }

    getXAxisTitleOnViewWithTitle(viewTitle) {
        var locator = By.css('.x.axis-label text');

        return this.findViewByTitle(viewTitle)
        .then((view) => {
            return this._findElement(locator);
        })
    }

    waitForXAxisTitleOnViewWithTitle(viewTitle, axisTitle) {
        return this.getXAxisTitleOnViewWithTitle(viewTitle)
        .then((element) => {
            return element.getAttribute('textContent')
            .then((text) => {
                expect(text).to.equal(axisTitle);
            });
        });
    }

    getYAxisTitleOnViewWithTitle(viewTitle) {
        var locator = By.css('.y.axis-label text');

        return this.findViewByTitle(viewTitle)
        .then((view) => {
            return this._findElement(locator);
        })
    }

    waitForYAxisTitleOnViewWithTitle(viewTitle, axisTitle) {
        return this.getYAxisTitleOnViewWithTitle(viewTitle)
        .then((element) => {
            return element.getAttribute('textContent')
            .then((text) => {
                expect(text).to.equal(axisTitle);
            });
        });
    }

    getXAxisLabelsOnViewWithTitle(title) {
        var locator = By.css('.x.axis .tick text');

        return this._findElement(locator)
        .then((view) => {
            return this.driver.wait(until.elementLocated(By.css('.x.axis .tick text')))
            .then(() => {
                return view.findElements(By.css('.x.axis .tick text'));
            });
        });
    }

    waitForXAxisLabelOnViewWithTitle(title, labels) {
        return this.getXAxisLabelsOnViewWithTitle(title)
        .then(function(labelElements) {
            return Promise.each(labelElements, function(labelElement, index) {
                return labelElement.getAttribute('textContent')
                .then((text) => {
                    expect(text).to.equal(labels[index]);
                });
            });
        });
    }

    getYAxisLabelsOnViewWithTitle(title) {
        var locator = By.css('.y.axis .tick text');

        return this._findElement(locator)
        .then((view) => {
            return this.driver.wait(until.elementLocated(By.css('.y.axis .tick text')))
            .then(() => {
                return view.findElements(By.css('.y.axis .tick text'));
            });
        });
    }

    waitForYAxisLabelOnViewWithTitle(title, labels) {
        return this.getXAxisLabelsOnViewWithTitle(title)
        .then(function(labelElements) {
            return Promise.each(labelElements, function(labelElement, index) {
                return labelElement.getAttribute('textContent')
                .then((text) => {
                    expect(text).to.equal(labels[index]);
                });
            });
        });
    }

    getBarsOnViewWithTitle(title) {
        return this.findViewByTitle(title)
        .then((view) => {
            return this.driver.wait(until.elementLocated(By.css('rect.bar')))
            .then(() => {
                return view.findElements(By.css('rect.bar'))
            })
            .then((elements) => {
                var self = this;
                return Promise.each(elements, function(element) {
                    return self.driver.wait(until.elementIsVisible(element));
                })
                .then(() => {
                    return elements;
                });
            });
        });
    }

    getSeriesOnViewWithTitle(title) {
        return this.findViewByTitle(title)
        .then((view) => {
            return this.driver.wait(until.elementLocated(By.css('.juttle-view .jut-chart-wrapper')))
            .then(() => {
                return view.findElement(By.css('.juttle-view .jut-chart-wrapper'));
            })
            .then((chartWrapper) => {
                return chartWrapper.findElements(By.css('g.series'));
            })
            .then((elements) => {
                var self = this;
                return Promise.each(elements, function(element) {
                    return self.driver.wait(until.elementIsVisible(element));
                })
                .then(() => {
                    return elements;
                });
            });
        });
    }

    getComputedStyleValue(element, styleName) {
        var script = 'return window.getComputedStyle(arguments[0])' +
                     ' .getPropertyValue(arguments[1]);';
        return this.driver.executeScript(script, element, styleName);
    }

    run(options) {
        var params = _.map(options, (value, name) => {
            return `${name}=${value}`;
        });
        var host = nconf.get('OUTRIGGER_HOST') || 'localhost';
        return this.driver.get('http://' + host + ':' + OUTRIGGER_PORT +
                               '/run?' + params.join('&'));
    }
}

module.exports = OutriggerTester;
