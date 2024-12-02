/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/xhr.js", "/Framework/data/list.js", "/Framework/debug.js", "/Framework/serviceLocator.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Data");
(function(undefined) {
    var MSE = WinJS.Namespace.define("MS.Entertainment", null);
    WinJS.Namespace.defineWithParent(MSE, "Data", {queryStatus: {
            idle: 0, requestingData: 1, processingData: 2, augmentingData: 3, completed: 4, failed: 5, max: 5, isWorking: function isWorking(status) {
                    return status === MSE.Data.queryStatus.requestingData || status === MSE.Data.queryStatus.processingData || status === MSE.Data.queryStatus.augmentingData
                }, hasCompleted: function isWorking(status) {
                    return status === MSE.Data.queryStatus.completed
                }, hasFailed: function isWorking(status) {
                    return status === MSE.Data.queryStatus.failed
                }, hasCompletedOrFailed: function isWorking(status) {
                    return status === MSE.Data.queryStatus.completed || status === MSE.Data.queryStatus.failed
                }
        }});
    WinJS.Namespace.defineWithParent(MSE, "Data", {observableQueryMixin: {
            enabled: false, status: MSE.Data.queryStatus.idle, cookie: null, errorCode: 0, errorObject: null, result: null, totalCount: -1
        }});
    WinJS.Namespace.defineWithParent(MSE, "Data", {ObservableQuery: WinJS.Class.mix(function observableQuery() {
            this._initObservable(Object.create(MS.Entertainment.Data.observableQueryMixin))
        }, WinJS.Utilities.eventMixin, WinJS.Binding.mixin, WinJS.Binding.expandProperties(MS.Entertainment.Data.observableQueryMixin))});
    WinJS.Namespace.defineWithParent(MSE, "Data", {
        Disposer: WinJS.Class.define(null, {
            dispose: function dispose() {
                var keys = Object.getOwnPropertyNames(this);
                for (var key in keys)
                    this.disposeOnly(key)
            }, disposeOnly: function disposeOnly(key) {
                    var object = this[key];
                    if (object && object.dispose)
                        object.dispose();
                    if (key !== "dispose" && key !== "disposeOnly")
                        delete this[key]
                }
        }), MainQuery: WinJS.Class.derive(MSE.Data.ObservableQuery, function mainQueryConstructor() {
                MSE.Data.ObservableQuery.prototype.constructor.call(this);
                this.status = MSE.Data.queryStatus.idle;
                this.autoUpdateProperties = this.autoUpdateProperties || {};
                this.autoUpdateProperties.enabled = true
            }, {
                _generation: 0, resultFactory: null, provider: null, autoUpdateProperties: null, listDestinationHint: null, generation: {get: function() {
                            return this._generation
                        }}, createResultObject: function createResultObject() {
                        return this.resultFactory(null, this)
                    }, createPendingResultObject: function createPendingResultObject(resultOverride) {
                        this._generation++;
                        var result = {
                                generation: this._generation, result: ((resultOverride) || this.createResultObject())
                            };
                        return result
                    }, execute: function execute(cookie) {
                        return WinJS.Promise.wrapError(this)
                    }, refresh: function refresh() {
                        var promise;
                        if (this.enabled)
                            promise = this.execute();
                        else
                            promise = WinJS.Promise.wrap(this);
                        return promise
                    }, getItems: function getItems() {
                        return this.execute().then(function executeCompleted() {
                                return this._getList()
                            }.bind(this))
                    }, getItemsAndIgnoreErrors: function getItemsAndIgnoreErrors() {
                        return this.getItems().then(function handleResult(result) {
                                return result
                            }, function handleError(error) {
                                MS.Entertainment.Data.fail("getItems failed. error.message = " + error && error.message);
                                return null
                            })
                    }, getItemsArrayAndIgnoreErrors: function getItemsArrayAndIgnoreErrors() {
                        return this.getItemsAndIgnoreErrors().then(function handleResult(result) {
                                return result ? result.toArrayAll() : []
                            }, function handleError(error) {
                                MS.Entertainment.Data.fail("getItemsAndIgnoreErrors failed. error.message = " + error && error.message);
                                return []
                            }).then(function handleResult(result) {
                                return result
                            }, function handleError(error) {
                                MS.Entertainment.Data.fail("toArrayAll failed. error.message = " + error && error.message);
                                return []
                            })
                    }, createGroupsQuery: function createGroupsQuery() {
                        return null
                    }, restore: function restore(cookie) {
                        return this.execute(cookie)
                    }, loadPreviousChunk: function loadPreviousChunk() {
                        return WinJS.Promise.wrap(this)
                    }, loadNextChunk: function loadNextChunk() {
                        return WinJS.Promise.wrap(this)
                    }, notify: function notify(propertyName, newValue, oldValue) {
                        if (!this.isDisposed && this.autoUpdateProperties && newValue !== oldValue && this.autoUpdateProperties[propertyName])
                            this.refresh().done(null, function error(){});
                        MSE.Data.ObservableQuery.prototype.notify.apply(this, arguments)
                    }, clone: function clone() {
                        var prototype = Object.getPrototypeOf(this);
                        var QueryConstructor = (prototype.constructor);
                        var newQuery = new QueryConstructor;
                        var addToPropertyValues = function addToPropertyValues(key) {
                                if (key !== "isLive")
                                    newQuery[key] = this[key]
                            }.bind(this);
                        while (prototype && prototype.constructor !== MS.Entertainment.Data.observableQueryMixin) {
                            Object.keys(prototype).forEach(addToPropertyValues);
                            prototype = Object.getPrototypeOf(prototype)
                        }
                        return newQuery
                    }, _getList: function _getList(resultOverride) {
                        var result = resultOverride || this.result;
                        var list = null;
                        if (this.listDestinationHint)
                            list = this._getListWorker(MS.Entertainment.Utilities.valueFromPropertyPath(result, this.listDestinationHint), 0, this.listDestinationHint);
                        if (!list)
                            list = this._getListWorker(result);
                        return list
                    }, _getListWorker: function _getListWorker(currentValue, depth, currentPath) {
                        var updatedPath,
                            key,
                            updatedValue;
                        var list = null;
                        depth = depth || 0;
                        currentPath = currentPath || String.empty;
                        currentValue = WinJS.Binding.unwrap(currentValue);
                        if (this._isListType(currentValue)) {
                            this.listDestinationHint = currentPath;
                            list = currentValue
                        }
                        else if (currentValue && typeof currentValue === "object" && !Array.isArray(currentValue) && depth < MSE.Data.MainQuery.maxListDepth)
                            for (key in currentValue)
                                if (key && key[0] !== "_")
                                    try {
                                        updatedValue = currentValue[key];
                                        updatedPath = currentPath ? currentPath + "." + key : key;
                                        list = this._getListWorker(updatedValue, depth + 1, updatedPath);
                                        if (list)
                                            break
                                    }
                                    catch(exception) {}
                        return list
                    }, _isListType: function _isListType(value) {
                        return MSE.Data.List.is(value)
                    }, _setResult: function _setResult(result, totalCount, error) {
                        this.result = result;
                        this.totalCount = totalCount;
                        this.dispatchEvent(MS.Entertainment.Data.MainQuery.events.resultChanged, {
                            sender: this, result: result, totalCount: totalCount, error: error
                        })
                    }, _handleEnabled: function _handleEnabled() {
                        this.refresh()
                    }
            }, {
                maxListDepth: 3, events: {resultChanged: "resultChanged"}, isQuery: function MainQuery_isQuery(object) {
                        return MS.Entertainment.Data.MainQuery.prototype.isPrototypeOf(object)
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Data", {
        RandomAccessChunk: WinJS.Class.define(function randomAccessChunk(startIndex, count) {
            this.startIndex = startIndex;
            this.count = count
        }, {
            startIndex: 0, count: 0
        }, {is: function randomAccessChunk_is(object) {
                return MS.Entertainment.Data.RandomAccessChunk.prototype.isPrototypeOf(object)
            }}), AugmentQuery: WinJS.Class.derive(MSE.Data.MainQuery, function() {
                MSE.Data.MainQuery.prototype.constructor.call(this)
            }, {
                _chunkDestination: null, _nextChunk: null, _previousChunk: null, _resultShape: null, _disposed: false, lastChunkedResult: null, resultFactory: MSE.Data.Factory.self, resultAugmentation: null, allowGroupHints: false, aggregateChunks: false, chunked: true, chunkSize: 100, currentChunk: null, clearResultOnFailure: false, dispose: function dispose() {
                        this.createPendingResultObject();
                        if (this._chunkDestination && this._chunkDestination.dispose)
                            this._chunkDestination.dispose();
                        this._clearChunkDestination();
                        this._clearListQueryHinter();
                        this._disposed = true
                    }, isDisposed: {get: function() {
                            return this._disposed
                        }}, nextChunk: {get: function() {
                            return this._nextChunk
                        }}, previousChunk: {get: function() {
                            return this._previousChunk
                        }}, hasNextChunk: {get: function() {
                            return (this.nextChunk !== null && this.nextChunk !== undefined && this.nextChunk !== MSE.Data.AugmentQuery.invalidNextChunk)
                        }}, hasPreviousChunk: {get: function() {
                            return (this.previousChunk !== null && this.previousChunk !== undefined && this.previousChunk !== MSE.Data.AugmentQuery.invalidPreviousChunk)
                        }}, isLoadingFromStart: {get: function() {
                            return this.currentChunk === null || this.currentChunk === undefined
                        }}, chunkDestinationHint: {
                        get: function() {
                            return this.listDestinationHint
                        }, set: function(value) {
                                this.listDestinationHint = value
                            }
                    }, chunkDestination: {get: function() {
                            return this._chunkDestination
                        }}, execute: function execute(cookie) {
                        this.currentChunk = (cookie === null || cookie === undefined) ? null : cookie;
                        return this._execute()
                    }, loadPreviousChunk: function loadPreviousChunk() {
                        if (this.previousChunk !== null && this.previousChunk !== undefined && this.previousChunk !== MSE.Data.AugmentQuery.invalidPreviousChunk) {
                            this.currentChunk = this.previousChunk;
                            return this._execute()
                        }
                        else
                            return WinJS.Promise.wrap(this)
                    }, loadNextChunk: function loadNextChunk() {
                        if (this.nextChunk !== null && this.nextChunk !== undefined && this.nextChunk !== MSE.Data.AugmentQuery.invalidNextChunk) {
                            this.currentChunk = this.nextChunk;
                            return this._execute()
                        }
                        else
                            return WinJS.Promise.wrap(this)
                    }, isValidChunk: function isValidChunk(chunk) {
                        return chunk !== null && chunk !== undefined && chunk !== MSE.Data.AugmentQuery.invalidNextChunk && chunk !== MSE.Data.AugmentQuery.invalidPreviousChunk
                    }, _isListType: function _isListType(value) {
                        return MSE.Data.VirtualList.is(value)
                    }, _getChunkDestination: function _getChunkDestination(resultOverride) {
                        return this._getList(resultOverride)
                    }, _getChunkDestination: function _getChunkDestination(resultOverride) {
                        return this._getList(resultOverride)
                    }, _setChunkDestination: function _setChunkDestination() {
                        if (this.aggregateChunks) {
                            this._chunkDestination = this._getChunkDestination();
                            if (this._chunkDestination)
                                this._chunkDestination.chunker = this
                        }
                        else
                            this._clearChunkDestination()
                    }, _clearChunkDestination: function _clearChunkDestination() {
                        if (this._chunkDestination) {
                            if (WinJS.Binding.unwrap(this._chunkDestination.chunker) === this)
                                this._chunkDestination.chunker = null;
                            this._chunkDestination = null
                        }
                    }, _setListQueryHinter: function _setListQueryHinter() {
                        var groupHintsQuery;
                        this._clearListQueryHinter();
                        if (this.allowGroupHints) {
                            groupHintsQuery = this.createGroupsQuery();
                            this._queryHinterDestination = this._getList()
                        }
                        if (this._queryHinterDestination)
                            this._queryHinterDestination.groupHinter = this.createGroupsQuery()
                    }, _clearListQueryHinter: function _clearListQueryHints() {
                        if (this._queryHinterDestination) {
                            if (WinJS.Binding.unwrap(this._queryHinterDestination.groupHinter) === this)
                                this._queryHinterDestination.groupHinter = null;
                            this._queryHinterDestination = null
                        }
                    }, _parseInnerResult: function _parseInnerResult(result) {
                        return result
                    }, _parseInnerProgress: function _parseInnerProgress(result) {
                        return result
                    }, _parseTotalCount: function _parseTotalCount(result) {
                        return -1
                    }, _getResultAugmentation: function _getResultAugmentation() {
                        return this.resultAugmentation
                    }, _calculateNextChunkKey: function _calculateNextChunkKey(result) {
                        return MSE.Data.AugmentQuery.invalidNextChunk
                    }, _calculatePreviousChunkKey: function _calculatePreviousChunkKey(result) {
                        return MSE.Data.AugmentQuery.invalidPreviousChunk
                    }, _startExecute: function _startExecute(){}, _preInnerExecute: function _preInnerExecute() {
                        return WinJS.Promise.wrap()
                    }, _startInnerExecute: function _startInnerExecute() {
                        return WinJS.Promise.wrapError()
                    }, _retryInnerExecute: function _retryInnerExecute(result, error) {
                        return false
                    }, _endInnerExecute: function _endInnerExecute(result){}, _preInsertChunk: function _preInsertChunk(destination, chunk){}, _execute: function _execute(chunkDestinationOverride) {
                        var innerPromise;
                        var that = this;
                        var pendingResult = this.createPendingResultObject();
                        var loadingFromStart = this.isLoadingFromStart;
                        var chunkingNext = this.nextChunk !== null && this.nextChunk !== undefined && this.currentChunk === this.nextChunk;
                        var chunkingPrevious = this.previousChunk !== null && this.previousChunk !== undefined && this.currentChunk === this.previousChunk;
                        var chunkingRandom = !loadingFromStart && MS.Entertainment.Data.RandomAccessChunk.is(this.currentChunk);
                        var aggregateChunking = this.aggregateChunks && (chunkingNext || chunkingPrevious || chunkingRandom);
                        var progressCallback;
                        function cleanUp() {
                            innerPromise = null;
                            pendingResult = null
                        }
                        {};
                        function cancelInnerPromiseNoError() {
                            if (innerPromise) {
                                if (pendingResult)
                                    pendingResult.generation = -1;
                                try {
                                    innerPromise.cancel()
                                }
                                catch(exception) {}
                            }
                            cleanUp()
                        }
                        {};
                        function cancelInnerPromise(cancelReason) {
                            cancelInnerPromiseNoError();
                            cancelReason = cancelReason || "unknown";
                            cancelReason = "Query was canceled. Cancel reason: " + cancelReason + ".";
                            return WinJS.Promise.wrapError(that._createError({
                                    name: "Canceled", description: cancelReason, message: cancelReason
                                }))
                        }
                        {};
                        function updateStatus(status) {
                            that.status = status;
                            progressCallback(that)
                        }
                        {};
                        function updateError(error) {
                            that.errorObject = that._createError(error);
                            that.errorCode = that.errorObject.number
                        }
                        {};
                        function clearErrorCode() {
                            that.errorCode = 0;
                            that.errorObject = null
                        }
                        {};
                        function handleInnerPromiseEvent(result, callback, preventFailure) {
                            if (pendingResult && pendingResult.generation === that.generation)
                                return callback(result);
                            else if (!preventFailure && !pendingResult)
                                return cancelInnerPromise("the cancel was invoked on the execute promise");
                            else if (!preventFailure && pendingResult.generation >= 0)
                                return cancelInnerPromise("the query.execute was invoked after this execution, " + (that.generation - pendingResult.generation) + " time(s)")
                        }
                        {};
                        function parseInnerResult(result) {
                            updateStatus(MSE.Data.queryStatus.augmentingData);
                            result = that._parseInnerResult(result);
                            return MSE.Data.augment(result, that._getResultAugmentation())
                        }
                        {};
                        function handleInnerCompleted(result) {
                            pendingResult.result = result;
                            that._setResult(pendingResult.result, that._parseTotalCount(pendingResult.result));
                            that._setChunkDestination();
                            that._setListQueryHinter();
                            return WinJS.Promise.wrap()
                        }
                        {};
                        function handleInnerCompletedChunked(result) {
                            pendingResult.result = result;
                            that.totalCount = that._parseTotalCount(pendingResult.result);
                            if (chunkingRandom)
                                return that._insertChunkAt(that.currentChunk.startIndex, that._getChunkDestination(result), chunkDestinationOverride);
                            else
                                return that._insertChunk(chunkingNext, that._getChunkDestination(result), chunkDestinationOverride)
                        }
                        {};
                        function handleInnerFailure(result) {
                            updateStatus(MSE.Data.queryStatus.failed);
                            updateError(result);
                            var newResult = that.clearResultOnFailure ? null : that.result;
                            that._setResult(newResult, that._parseTotalCount(newResult), result);
                            return WinJS.Promise.wrapError(result)
                        }
                        {};
                        function handleInnerProgress(result) {
                            updateStatus(that._parseInnerProgress(result))
                        }
                        {};
                        function executeCompleted() {
                            if (!that.chunked || !that.chunkSize)
                                that._nextChunk = null;
                            else if (chunkingNext || loadingFromStart || chunkingRandom || that._nextChunk === null || that._nextChunk === undefined)
                                that._nextChunk = that._calculateNextChunkKey(pendingResult.result);
                            if (that._nextChunk === null || that._nextChunk === undefined)
                                that._nextChunk = MSE.Data.AugmentQuery.invalidNextChunk;
                            if (!that.chunked || !that.chunkSize)
                                that._previousChunk = null;
                            else if (chunkingPrevious || loadingFromStart || chunkingRandom || that._previousChunk === null || that._previousChunk === undefined)
                                that._previousChunk = that._calculatePreviousChunkKey(pendingResult.result);
                            if (that._previousChunk === null || that._previousChunk === undefined)
                                that._previousChunk = MSE.Data.AugmentQuery.invalidPreviousChunk;
                            if (chunkingPrevious || chunkingNext || chunkingRandom)
                                that.lastChunkedResult = pendingResult.result;
                            that._endInnerExecute(pendingResult.result);
                            updateStatus(MSE.Data.queryStatus.completed)
                        }
                        {};
                        function wrapPromiseHandler(callback, preventFailure) {
                            return function(result) {
                                    return handleInnerPromiseEvent(result, callback, preventFailure)
                                }
                        }
                        {};
                        function handlePromiseFailure(error) {
                            return WinJS.Promise.wrapError(error)
                        }
                        {};
                        function testRetry(result, error) {
                            var promise;
                            if (result)
                                result = parseInnerResult(result);
                            if (that._retryInnerExecute(result, error))
                                promise = startInnerExecute();
                            else {
                                var promise = !!error ? wrapPromiseHandler(handleInnerFailure)(error) : wrapPromiseHandler(aggregateChunking ? handleInnerCompletedChunked : handleInnerCompleted)(result);
                                promise = WinJS.Promise.as(promise).then(wrapPromiseHandler(executeCompleted), handlePromiseFailure)
                            }
                            return promise
                        }
                        {};
                        function testRetryOnSuccess(result) {
                            return testRetry(result)
                        }
                        {};
                        function testRetryOnError(error) {
                            return testRetry(null, error)
                        }
                        {};
                        function createInnerPromise(completed, failed, progress) {
                            progressCallback = progressCallback || progress;
                            clearErrorCode();
                            updateStatus(MSE.Data.queryStatus.requestingData);
                            if (!aggregateChunking)
                                that._clearChunkDestination();
                            innerPromise = that._startInnerExecute().then(wrapPromiseHandler(testRetryOnSuccess), wrapPromiseHandler(testRetryOnError), wrapPromiseHandler(handleInnerProgress, true)).then(function innerPromiseCompleted() {
                                completed(that);
                                cleanUp()
                            }, function innerPromiseFailed(error) {
                                failed(that._createError(error));
                                cleanUp()
                            })
                        }
                        this._startExecute();
                        function startInnerExecute() {
                            return WinJS.Promise.as(that._preInnerExecute()).then(function() {
                                    return new WinJS.Promise(createInnerPromise, cancelInnerPromiseNoError)
                                })
                        }
                        return startInnerExecute()
                    }, _createError: function _createError(error, description) {
                        var newError = new Error(description);
                        if (error)
                            MS.Entertainment.Utilities.BindingAgnostic.setProperties(newError, error);
                        newError.errorCode = newError.number;
                        newError.originalError = error;
                        newError.details = {query: this};
                        return newError
                    }, _insertChunkAt: function(startIndex, list, chunkDestinationOverride) {
                        var promise;
                        var destination = chunkDestinationOverride || this.chunkDestination;
                        if (!destination)
                            promise = WinJS.Promise.wrapError(new Error("no destination was found when inserting chunk at index"));
                        else if (list && destination.insertRangeAt) {
                            this._preInsertChunk(destination, list);
                            promise = destination.insertRangeAt(startIndex, list.source, {
                                suppressEvents: true, isSourceData: true
                            })
                        }
                        else
                            promise = WinJS.Promise.wrap()
                    }, _insertChunk: function(nextChunk, list, chunkDestinationOverride) {
                        var promise;
                        var destination = chunkDestinationOverride || this.chunkDestination;
                        if (!destination)
                            promise = WinJS.Promise.wrapError(new Error("no destination was found when inserting chunk"));
                        else if (list && destination.insertRangeAtEnd && destination.insertRangeAtStart) {
                            this._preInsertChunk(destination, list);
                            if (nextChunk)
                                promise = destination.insertRangeAtEnd(list.source, {
                                    suppressEvents: true, isSourceData: true
                                });
                            else
                                promise = destination.insertRangeAtStart(list.source, {
                                    suppressEvents: true, isSourceData: true
                                })
                        }
                        else
                            promise = WinJS.Promise.wrap();
                        return promise
                    }, _getChunkResultSize: function _getChunkResultSize(result) {
                        var resultSize = 0;
                        var listResult;
                        if (result && !isNaN(result.count))
                            resultSize = result.count;
                        else
                            listResult = this._getChunkDestination(result);
                        if (listResult)
                            if (listResult.hasCount)
                                resultSize = listResult.count;
                            else if (listResult.source)
                                resultSize - listResult.source.length;
                        return resultSize || 0
                    }
            }, {
                invalidNextChunk: {}, invalidPreviousChunk: {}, _findAugmentation: function _findAugmentation(augmentation, testCallback) {
                        var propertyName;
                        var propertyAugmentation;
                        var itemAugmentationOrFactory;
                        var key;
                        var augmentationShape = MS.Entertainment.Data.augmentationShape(augmentation);
                        if (augmentationShape)
                            for (key in augmentationShape) {
                                propertyAugmentation = augmentationShape[key];
                                if (testCallback(key, propertyAugmentation)) {
                                    propertyName = key;
                                    break
                                }
                                propertyAugmentation = null
                            }
                        if (propertyAugmentation && propertyAugmentation.augmentationOptions && propertyAugmentation.augmentationOptions.itemAugmentationOrFactory)
                            itemAugmentationOrFactory = propertyAugmentation.augmentationOptions.itemAugmentationOrFactory;
                        return {
                                key: propertyName, augmentation: propertyAugmentation, itemAugmentationOrFactory: itemAugmentationOrFactory
                            }
                    }, findAugmentation: function findAugmentation(augmentation, key) {
                        return MS.Entertainment.Data.AugmentQuery._findAugmentation(augmentation, function isList(testKey, testAugmentation) {
                                return testKey === key
                            })
                    }, findListAugmentation: function findListAugmentation(augmentation) {
                        return MS.Entertainment.Data.AugmentQuery._findAugmentation(augmentation, function isList(testKey, testAugmentation) {
                                return MS.Entertainment.Data.Property.isList(testAugmentation)
                            })
                    }, modifyResultAugmentation: function modifyResultAugmentation(augmentation, key, definition) {
                        var result = augmentation;
                        var itemAugmentation;
                        var rootDefinition;
                        var property = MS.Entertainment.Data.AugmentQuery.findAugmentation(augmentation, key);
                        if (property.key && property.augmentation) {
                            rootDefinition = {};
                            itemAugmentation = property.augmentation.augmentationOptions ? property.augmentation.augmentationOptions.augmentation : null;
                            itemAugmentation = MS.Entertainment.Data.derive(itemAugmentation || null, null, definition);
                            rootDefinition[property.key] = MS.Entertainment.Data.Property.createAugmentation(property.augmentation, {augmentation: itemAugmentation})
                        }
                        if (augmentation && rootDefinition)
                            result = MS.Entertainment.Data.derive(augmentation, null, rootDefinition);
                        return result
                    }, modifyListResultAugmentation: function modifyListResultAugmentation(augmentation, definition) {
                        var result = augmentation;
                        var listPropertyAugmentation;
                        var listItemAugmentation;
                        var rootDefinition;
                        var listProperty = MS.Entertainment.Data.AugmentQuery.findListAugmentation(augmentation);
                        if (listProperty.key && listProperty.augmentation) {
                            rootDefinition = {};
                            listItemAugmentation = MS.Entertainment.Data.Factory.createDerivedAugmentationOrFactory(listProperty.itemAugmentationOrFactory, definition);
                            rootDefinition[listProperty.key] = MS.Entertainment.Data.Property.createAugmentation(listProperty.augmentation, {itemAugmentationOrFactory: listItemAugmentation})
                        }
                        if (augmentation && rootDefinition)
                            result = MS.Entertainment.Data.derive(augmentation, null, rootDefinition);
                        return result
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Data", {AggregateQuery: WinJS.Class.derive(MSE.Data.AugmentQuery, function aggregateQuery() {
            MSE.Data.AugmentQuery.prototype.constructor.call(this);
            this.queries = []
        }, {
            queries: null, executeSequentially: false, resultAugmentationFactory: null, _handleIntermediateResult: function _handleIntermediateResult(sourceIndex, sourceResult){}, _startNonSequentialExecution: function _startSequentialExecution() {
                    var executePromises = [];
                    var index = 0;
                    var queryChunk = null;
                    this.queries.forEach(function executeQuery(query) {
                        queryChunk = this._getQueryChunk(index);
                        if (query && queryChunk !== undefined) {
                            query.aggregateChunks = this.chunked ? false : query.aggregateChunks;
                            executePromises.push(query.execute(queryChunk))
                        }
                        else
                            executePromises.push(WinJS.Promise.as({}));
                        index++
                    }, this);
                    return WinJS.Promise.join(executePromises)
                }, _startSequentialExecution: function _startSequentialExecution() {
                    var results = [];
                    return new WinJS.Promise(function initializePromise(completeCallback, errorCallback) {
                            this._continueSequentialExecution(0, results, completeCallback, errorCallback)
                        }.bind(this))
                }, _continueSequentialExecution: function _continueSequentialExecution(index, results, completeCallback, errorCallback) {
                    if (index >= this.queries.length) {
                        completeCallback(results);
                        return
                    }
                    var query = this.queries[index];
                    var queryChunk = this._getQueryChunk(index);
                    var queryExecutePromise;
                    if (query && queryChunk !== undefined) {
                        query.aggregateChunks = this.chunked ? false : query.aggregateChunks;
                        queryExecutePromise = query.execute(queryChunk)
                    }
                    else
                        queryExecutePromise = WinJS.Promise.as({});
                    queryExecutePromise.then(function queryFinished(result) {
                        results[index] = result;
                        this._handleIntermediateResult(index, result.result);
                        this._continueSequentialExecution(index + 1, results, completeCallback, errorCallback)
                    }.bind(this), function queryFailed(error) {
                        errorCallback(error)
                    }.bind(this))
                }, _getQueryChunk: function _getQueryChunk(index) {
                    var executeChunk;
                    if (this.isLoadingFromStart || !this.chunked)
                        executeChunk = null;
                    else if (this.isValidChunk(this.currentChunk[index]))
                        executeChunk = this.currentChunk[index];
                    return executeChunk
                }, _startInnerExecute: function _startInnerExecute() {
                    var innerPromise;
                    var lowestProgressValue = MSE.Data.queryStatus.max;
                    var loadingFromStart = this.isLoadingFromStart;
                    if (!this.resultAugmentation && this.resultAugmentationFactory && this.resultAugmentationFactory.create)
                        this.resultAugmentation = this.resultAugmentationFactory.create();
                    var returnedProgress;
                    function handleCompleted(result) {
                        returnedProgress(MSE.Data.queryStatus.processingData);
                        var wrapped = new MS.Entertainment.Data.Property.MergedItem;
                        result.forEach(function appendItem(item) {
                            wrapped.source.push(WinJS.Binding.unwrap(item ? item.result : {}))
                        }, this);
                        return wrapped
                    }
                    {};
                    function handleError(error) {
                        var result = error;
                        if (Array.isArray(error))
                            for (var i = 0; i < error.length; i++)
                                if (error[i] && error[i].errorObject) {
                                    error = error[i].errorObject;
                                    break
                                }
                        return WinJS.Promise.wrapError(error || {})
                    }
                    {};
                    function initializePromise(completed, failed, progress) {
                        returnedProgress = progress;
                        if (this.executeSequentially)
                            innerPromise = this._startSequentialExecution();
                        else
                            innerPromise = this._startNonSequentialExecution();
                        innerPromise.then(handleCompleted.bind(this), handleError.bind(this)).then(function innerCompleted(wrapped) {
                            completed(wrapped)
                        }.bind(this), function innerFailed(error) {
                            failed(error)
                        }.bind(this))
                    }
                    {};
                    function cancelPromise() {
                        if (innerPromise) {
                            innerPromise.cancel();
                            innerPromise = null
                        }
                    }
                    {};
                    return new WinJS.Promise(initializePromise.bind(this), cancelPromise.bind(this))
                }, _calculateNextChunkKey: function _calculateNextChunkKey(result) {
                    var nextChunk = null;
                    var index = 0;
                    if (this.queries && this.queries.length && (!this.aggregateChunks || this._getChunkResultSize(result)))
                        this.queries.forEach(function(query) {
                            if (query && query.nextChunk) {
                                nextChunk = nextChunk || [];
                                nextChunk.length = index + 1;
                                nextChunk[index] = query.nextChunk
                            }
                            index++
                        }, this);
                    return nextChunk
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Data", {
        InnerGroupsQuery: WinJS.Class.define(function InnerGroupsQuery(innerQuery)
        {
            if (!innerQuery || !innerQuery.getGroupsAsync)
                throw new Error("Invalid argument passed to InnerGroupsQuery");
            this._innerQuery = innerQuery
        }, {
            _innerQuery: null, currentPage: null, previousPage: null, nextPage: null, dispose: function dispose() {
                    this._innerQuery = null
                }, setCursorPosition: function setCursorPosition(){}, execute: function execute() {
                    return this.executeAsync()
                }, executeAsync: function executeAsync() {
                    var result;
                    if (this._innerQuery)
                        result = this._innerQuery.getGroupsAsync().then(function extractJson(result) {
                            if (result && "json" in result)
                                result = result.json;
                            return result
                        });
                    else
                        result = WinJS.Promise.wrapError("InnerGroupsQuery has been disposed of");
                    return result
                }
        }), WrapperQuery: WinJS.Class.derive(MSE.Data.AugmentQuery, function() {
                MSE.Data.AugmentQuery.prototype.constructor.call(this)
            }, {
                _innerQuery: null, queryId: null, groupsAugmentation: null, dispose: function dispose() {
                        MSE.Data.AugmentQuery.prototype.dispose.call(this);
                        this.releaseInnerQuery()
                    }, createInnerQuery: function createInnerQuery() {
                        return null
                    }, createGroupsQuery: function createGroupsQuery() {
                        var result = null;
                        var innerQuery;
                        if (this.allowGroupHints)
                            innerQuery = this._getInnerQuery();
                        if (innerQuery && innerQuery.getGroupsAsync) {
                            result = new MSE.Data.WrapperQuery;
                            result.resultAugmentation = WinJS.Binding.unwrap(this.groupsAugmentation);
                            result.chunked = false;
                            result._innerQuery = new MSE.Data.InnerGroupsQuery(innerQuery)
                        }
                        return result
                    }, releaseInnerQuery: function releaseInnerQuery() {
                        if (this._innerQuery && this._innerQuery.dispose) {
                            this._innerQuery.dispose();
                            this._innerQuery = null
                        }
                        this._onReleaseInnerQuery()
                    }, _onReleaseInnerQuery: function _onReleaseInnerQuery(){}, _parseInnerResult: function _parseInnerResult(result) {
                        if (result)
                            try {
                                return JSON.parse(result)
                            }
                            catch(error) {
                                MS.Entertainment.Data.fail("WrapperQuery::_parseInnerResult has failed because JSON.parse failed. error message = " + (error && error.message) + " result = " + result);
                                throw error;
                            }
                        else
                            throw new Error("WrapperQuery._parseInnerResult failed. Result was null or empty");
                    }, _parseInnerProgress: function _parseInnerProgress(result) {
                        var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        eventProvider.traceServiceQuery_QueryReturn(this._innerQuery ? this._innerQuery.uri : String.empty);
                        return MSE.Data.queryStatus.processingData
                    }, _prepareQueryForInnerExecute: function _prepareQueryForInnerExecute(query){}, _startInnerExecute: function _startInnerExecute() {
                        if (this.isDisposed) {
                            MSE.Data.assert(false, "Attempting to execute a disposed wrapper query.");
                            return WinJS.Promise.wrapError(new Error("Attempting to execute a disposed wrapper query."))
                        }
                        var innerQuery = this._getInnerQuery();
                        if (!MS.Entertainment.Data.RandomAccessChunk.is(this.currentChunk))
                            this._innerQuery.currentPage = this.currentChunk;
                        else
                            this._innerQuery.currentPage = null;
                        var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        eventProvider.traceServiceQuery_QueryStart(this._innerQuery.uri);
                        return (innerQuery.executeAsync) ? innerQuery.executeAsync() : innerQuery.execute()
                    }, _getInnerQuery: function _getInnerQuery() {
                        this._innerQuery = this._innerQuery || this.createInnerQuery();
                        this._prepareQueryForInnerExecute(this._innerQuery);
                        return this._innerQuery
                    }, _calculateNextChunkKey: function _calculateNextChunkKey(result) {
                        if (this._innerQuery && this._getChunkResultSize(result))
                            return this._innerQuery.nextPage;
                        else
                            return null
                    }, _calculatePreviousChunkKey: function _calculatePreviousChunkKey(result) {
                        if (this._innerQuery && this._getChunkResultSize(result))
                            return this._innerQuery.previousPage;
                        else
                            return null
                    }, _endInnerExecute: function _endInnerExecute(result) {
                        if (this._innerQuery) {
                            var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                            eventProvider.traceServiceQuery_ParseComplete(this._innerQuery.uri);
                            this.currentChunk = this._innerQuery.currentPage
                        }
                    }, _getResultAugmentation: function _getResultAugmentation() {
                        var resultAugmentation = MSE.Data.AugmentQuery.prototype._getResultAugmentation.call(this);
                        if (resultAugmentation && this.queryId) {
                            resultAugmentation = MS.Entertainment.Data.AugmentQuery.modifyListResultAugmentation(resultAugmentation, {queryId: this.queryId});
                            resultAugmentation = MS.Entertainment.Data.AugmentQuery.modifyResultAugmentation(resultAugmentation, "item", {queryId: this.queryId})
                        }
                        return resultAugmentation
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Data", {
        ServiceWrapperQuery: WinJS.Class.derive(MSE.Data.WrapperQuery, function() {
            MSE.Data.WrapperQuery.prototype.constructor.call(this)
        }, {
            _shouldAuthenticate: false, _signInHandler: null, autoEncodeUri: true, useCache: null, useIfMatchCache: null, serviceType: 0, resourceURI: null, parameters: null, pluralizers: null, headers: null, postData: null, requestType: null, _authenticationHeader: null, forceLowercaseJsonProperties: false, dispose: function dispose() {
                    MSE.Data.WrapperQuery.prototype.dispose.call(this);
                    this._unregisterForSignInEvents()
                }, shouldAuthenticate: {
                    get: function() {
                        return this._shouldAuthenticate
                    }, set: function(value) {
                            if (this._shouldAuthenticate !== value) {
                                var oldValue = value;
                                this._shouldAuthenticate = value;
                                this.notify("shouldAuthenticate", value, oldValue);
                                this._unregisterForSignInEvents();
                                this._registerForSignInEvents()
                            }
                        }
                }, createResourceURI: function createResourceURI() {
                    return this.resourceURI
                }, createPostData: function createPostData() {
                    return WinJS.Binding.unwrap(this.postData)
                }, createParameters: function createParameters() {
                    return WinJS.Binding.unwrap(this.parameters)
                }, createHeaders: function createHeaders() {
                    return WinJS.Binding.unwrap(this.headers)
                }, _createAuthenticationHeader: function _createAuthenticationHeader() {
                    return WinJS.Binding.unwrap(this._authenticationHeader)
                }, hasAuthenticationHeader: function hasAuthenticationHeader() {
                    var header = this._createAuthenticationHeader();
                    return !!header && !!header.value
                }, createPluralizers: function createPluralizers() {
                    return this.pluralizers
                }, addHeader: function addHeader(key, value) {
                    if (!this.headers)
                        this.headers = {};
                    this.headers[key] = value
                }, createInnerQuery: function createInnerQuery() {
                    return new Microsoft.Entertainment.Queries.ServiceXMLQuery
                }, getResponseVersion: function getResponseVersion(result){}, _registerForSignInEvents: function _registerForSignInEvents() {
                    this._unregisterForSignInEvents();
                    if (this.shouldAuthenticate && this.autoUpdateProperties && this.autoUpdateProperties.isSignedIn) {
                        var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        this._signInHandler = WinJS.Binding.bind(signInService, {isSignedIn: function(value, oldValue) {
                                if (oldValue !== undefined)
                                    this.notify("isSignedIn", value, oldValue)
                            }.bind(this)})
                    }
                }, _unregisterForSignInEvents: function _unregisterForSignInEvents() {
                    if (this._signInHandler) {
                        this._signInHandler.cancel();
                        this._signInHandler = null
                    }
                }, _prepareQueryForInnerExecute: function _prepareQueryForInnerExecute(query) {
                    var pluralizers;
                    var parameters;
                    var key;
                    var value;
                    var uri;
                    uri = this.createResourceURI();
                    query.uri = this.autoEncodeUri ? window.encodeURI(uri) : uri;
                    query.serviceType = this.serviceType;
                    pluralizers = this.createPluralizers();
                    if (pluralizers)
                        query.pluralizationRules = pluralizers;
                    parameters = this.createParameters();
                    if (parameters)
                        for (key in parameters)
                            if (parameters.hasOwnProperty(key)) {
                                value = parameters[key];
                                if (value || value === 0)
                                    query.addParameter(window.encodeURIComponent(key), window.encodeURIComponent(value).replace(/%2B/g, "+"))
                            }
                    var headers = this.createHeaders();
                    if (headers)
                        for (key in headers)
                            if (headers.hasOwnProperty(key)) {
                                value = headers[key];
                                if (value || value === 0)
                                    query.addHeader(key, value.toString())
                            }
                    var authenticationHeader = this._createAuthenticationHeader();
                    if (authenticationHeader)
                        query.addHeader(authenticationHeader.key, authenticationHeader.value.toString());
                    var postData = this.createPostData();
                    if (postData && postData.contentType && postData.data)
                        query.setPostData(postData.contentType, postData.data);
                    if (this.requestType)
                        query.requestType = this.requestType;
                    if (this.useCache !== null)
                        query.useCache = this.useCache;
                    if (this.useIfMatchCache !== null)
                        query.useIfMatchCache = this.useIfMatchCache;
                    query.forceLowercaseJsonProperties = this.forceLowercaseJsonProperties;
                    this._registerForSignInEvents()
                }, _preInnerExecute: function _preInnerExecute() {
                    var promise;
                    var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (this.shouldAuthenticate && signInService.isSignedIn)
                        promise = signInService.getAuthHeader().then(function setAuthHeader(header) {
                            this._authenticationHeader = header
                        }.bind(this), function getAuthHeaderFailed(error) {
                            this._clearAuthentication();
                            return WinJS.Promise.wrapError(this._createError(error, "Invalid header for authenticated ServiceWrapperQuery"))
                        }.bind(this));
                    else
                        this._clearAuthentication();
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (configurationManager.service.enableTimeTravel && !promise)
                        if (this.serviceType === MS.Entertainment.Data.ServiceWrapperQuery.ServiceTypes.jsonEDS)
                            promise = signInService.signIn().then(function success() {
                                return signInService.getAuthHeader().then(function setAuthHeader(header) {
                                        this._authenticationHeader = header
                                    }.bind(this), function getAuthHeaderFailed(error) {
                                        this._clearAuthentication();
                                        return WinJS.Promise.wrapError(this._createError(error, "Invalid header for authenticated ServiceWrapperQuery"))
                                    }.bind(this))
                            }.bind(this));
                        else
                            promise = signInService.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_Passport), true, Microsoft.Entertainment.Util.SignInPromptType.doNotPrompt).then(function setHeader(ticket) {
                                this._authenticationHeader = {
                                    key: "Authorization", value: "WLID1.0 " + ticket
                                }
                            }.bind(this), function getHeaderFailed(error) {
                                return WinJS.Promise.wrapError(this._createError(error, "Invalid header for authenticated ServiceWrapperQuery"))
                            }.bind(this));
                    return WinJS.Promise.as(promise)
                }, _endInnerExecute: function _endInnerExecute(result) {
                    MS.Entertainment.Data.WrapperQuery.prototype._endInnerExecute.apply(this, arguments);
                    var version = this.getResponseVersion(result);
                    if (version && this.useIfMatchCache) {
                        var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                        mediaStore.offlineDetailProvider.setIfMatchValueWithKeyAsync(this._innerQuery.uri, version).done(function setIfMatchValueWithKeyAsync_completed(){}, function setIfMatchValueWithKeyAsync_error() {
                            MSE.Data.assert(false, "Failed to write cache version for if-match query")
                        })
                    }
                }, _clearAuthentication: function _clearAuthentication() {
                    if (this._authenticationHeader)
                        this._authenticationHeader = {
                            key: this._authenticationHeader.key, value: String.empty
                        }
                }, _parseInnerResult: function _parseInnerResult(result) {
                    if (result && result.json)
                        try {
                            return JSON.parse(result.json)
                        }
                        catch(error) {
                            MS.Entertainment.Data.fail("ServiceWrapperQuery::_parseInnerResult has failed because JSON.parse failed. error message = " + (error && error.message) + " result.json = " + result.json);
                            throw error;
                        }
                    else
                        throw new Error("ServiceWrapperQuery._parseInnerResult failed. Result was null or empty");
                }, _calculatePreviousChunkKey: function _calculatePreviousChunkKey(result) {
                    return MSE.Data.AugmentQuery.invalidPreviousChunk
                }
        }, {
            ServiceTypes: {jsonEDS: 1}, RequestTypes: {
                    head: 1, get: 2, post: 3, put: 4, deleteRequest: 5
                }
        }), LibraryWrapperQuery: WinJS.Class.derive(MSE.Data.WrapperQuery, function() {
                MSE.Data.WrapperQuery.prototype.constructor.call(this);
                this._currentStateChangePromise = WinJS.Promise.wrap()
            }, {
                allowReset: false, _isLive: false, _isAttached: false, _queryEventHandlers: null, _pauseCount: 0, _currentStateChangePromise: null, isLive: {
                        get: function get_isLive() {
                            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            return this._isLive && configurationManager.shell.uiRefresh
                        }, set: function set_isLive(value) {
                                if (value !== this._isLive) {
                                    if (this._isAttached) {
                                        MSE.Data.assert(!value, "Cannot set a query back to live after it has been run.");
                                        if (!value)
                                            this.releaseInnerQuery()
                                    }
                                    this._isLive = value
                                }
                            }
                    }, pause: function pause() {
                        if (this.isDisposed)
                            return WinJS.Promise.wrap();
                        var promise;
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        this._pauseCount++;
                        if (configurationManager.shell.uiRefresh && this._innerQuery && this._pauseCount === 1 && this.isLive) {
                            var queryPause = function queryPause() {
                                    if (this._innerQuery && this.isLive)
                                        return this._innerQuery.pauseAsync();
                                    else
                                        return false
                                }.bind(this);
                            promise = this._currentStateChangePromise = this._currentStateChangePromise.then(queryPause, queryPause)
                        }
                        return WinJS.Promise.as(promise)
                    }, unpause: function unpause() {
                        if (this.isDisposed)
                            return WinJS.Promise.wrap();
                        var promise;
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        this._pauseCount--;
                        if (configurationManager.shell.uiRefresh && this._innerQuery && this._pauseCount === 0 && this.isLive) {
                            var queryResume = function queryResume() {
                                    if (this._innerQuery && this.isLive)
                                        return this._innerQuery.resumeAsync();
                                    else
                                        return false
                                }.bind(this);
                            promise = this._currentStateChangePromise = this._currentStateChangePromise.then(queryResume, queryResume)
                        }
                        if (this._pauseCount < 0)
                            this._pauseCount = 0;
                        return WinJS.Promise.as(promise)
                    }, forceLiveRefresh: function forceLiveRefresh() {
                        if (this.isLive && this._innerQuery && this._innerQuery.refreshAsync)
                            this._innerQuery.refreshAsync()
                    }, loadChunk: function loadChunk(startIndex, countBefore, countAfter, destinationList) {
                        var endIndex = startIndex;
                        var originalStartIndex = startIndex;
                        destinationList = destinationList || true;
                        if (isNaN(startIndex))
                            throw new Error("loadChunk failed. startIndex is not a number: " + startIndex);
                        else if (startIndex < 0)
                            throw new Error("loadChunk failed. startIndex is out of range: " + startIndex);
                        else if (this.totalCount < 0)
                            throw new Error("loadChunk failed. totalCount is unknown, thus random access is not possible");
                        countBefore = (isNaN(countBefore) || countBefore < 0) ? 0 : countBefore;
                        countAfter = (isNaN(countAfter) || countAfter < 0) ? 0 : countAfter;
                        endIndex = startIndex + countAfter;
                        startIndex = Math.max(0, startIndex - countBefore);
                        this.currentChunk = new MS.Entertainment.Data.RandomAccessChunk(startIndex, endIndex - startIndex + 1);
                        this.nextChunk = MS.Entertainment.Data.AugmentQuery.invalidNextChunk;
                        this.previousChunk = MS.Entertainment.Data.AugmentQuery.invalidPreviousChunk;
                        return this._execute(destinationList).then(function(result) {
                                var list = this._getChunkDestination(this.lastChunkedResult);
                                list = (list) ? list.source : [];
                                return {
                                        items: list, offset: originalStartIndex - startIndex, totalCount: this.totalCount
                                    }
                            }.bind(this), function error() {
                                return {
                                        items: [], offset: 0, error: true, totalCount: this.totalCount
                                    }
                            }.bind(this))
                    }, invariantFromIndex: function invariantFromIndex(index) {
                        return this._chunkDestination.keyFromIndex(index)
                    }, indexFromInvariant: function indexFromInvariant(key) {
                        return this._chunkDestination.indexFromKey(key)
                    }, execute: function execute(cookie) {
                        this.releaseInnerQuery();
                        return MSE.Data.WrapperQuery.prototype.execute.apply(this, arguments)
                    }, _onReleaseInnerQuery: function _onReleaseInnerQuery() {
                        this._pauseCount = 0;
                        this._isAttached = false;
                        this._cancelQueryEventHandlers()
                    }, _parseInnerResult: function _parseInnerResult(result) {
                        if (result) {
                            var jsonString;
                            if (typeof result === "string")
                                jsonString = result;
                            else if (typeof result === "object" && result.json)
                                jsonString = result.json;
                            try {
                                return JSON.parse(jsonString)
                            }
                            catch(error) {
                                MS.Entertainment.Data.fail("LibraryWrapperQuery::_parseInnerResult has failed because JSON.parse failed. error message = " + (error && error.message) + " jsonString = " + jsonString);
                                throw error;
                            }
                        }
                        throw new Error("LibraryWrapperQuery._parseInnerResult failed.");
                    }, _parseTotalCount: function _parseTotalCount(result) {
                        return (!result || isNaN(result.totalCount)) ? -1 : result.totalCount
                    }, _prepareQueryForInnerExecute: function _prepareQueryForInnerExecute(innerQuery) {
                        if (MS.Entertainment.Data.RandomAccessChunk.is(this.currentChunk)) {
                            innerQuery.pageSize = this.currentChunk.count;
                            innerQuery.setCursorPosition(this.currentChunk.startIndex)
                        }
                        else {
                            innerQuery.pageSize = this.chunkSize;
                            innerQuery.setCursorPosition(0)
                        }
                        innerQuery.groupsEnabled = this.allowGroupHints;
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        if (configurationManager.shell.uiRefresh && !this._isAttached) {
                            this._cancelQueryEventHandlers();
                            if (this.isLive)
                                this._queryEventHandlers = MS.Entertainment.Utilities.addEvents(innerQuery, {querychanged: this._resultChanged.bind(this)});
                            else
                                innerQuery.dispose();
                            this._isAttached = true
                        }
                    }, _cancelQueryEventHandlers: function _cancelQueryEventHandlers() {
                        if (this._queryEventHandlers) {
                            this._queryEventHandlers.cancel();
                            this._queryEventHandlers = null
                        }
                    }, _increaseTotalCount: function _increaseTotalCount(value) {
                        if (this.totalCount >= 0)
                            this.totalCount += value
                    }, _resultChanged: function _resultChanged(args) {
                        if (args.target !== this._innerQuery)
                            return;
                        MSE.Data.assert(args && args.json, "Invalid args given to _resultsChanged");
                        var changes;
                        var maxChanges = 300;
                        var totalCount = NaN;
                        if (this._chunkDestination) {
                            try {
                                result = JSON.parse(args.json)
                            }
                            catch(error) {
                                MSE.Data.assert(false, "JSON parse failed in _resultsChanged. [error message: " + error.message + "] [json string: " + (args ? args.JSON : "<args NULL>") + "]");
                                result = {}
                            }
                            if (result.TotalCount !== null && !isNaN(result.TotalCount))
                                totalCount = this.totalCount = result.TotalCount;
                            changes = result.changes || [];
                            if (changes.length > maxChanges && this.allowReset) {
                                this.releaseInnerQuery();
                                this.dispatchEvent(MS.Entertainment.Data.chunkerEvents.reset, {
                                    sender: this, totalCount: totalCount
                                })
                            }
                            else
                                this.dispatchEvent(MS.Entertainment.Data.chunkerEvents.batchChange, {
                                    sender: this, changes: changes, totalCount: totalCount
                                })
                        }
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Data", {JSonWrapperQuery: WinJS.Class.derive(MSE.Data.AugmentQuery, function() {
            MSE.Data.AugmentQuery.prototype.constructor.call(this)
        }, {
            _innerQuery: null, headers: {}, createResourceUri: function createResourceUri() {
                    throw new Error("createResourceUri is not defined");
                }, _parseInnerResult: function _parseInnerResult(result) {
                    if (result && result.response)
                        try {
                            return JSON.parse(result.response)
                        }
                        catch(error) {
                            MS.Entertainment.Data.fail("JSonWrapperQuery::_parseInnerResult has failed because JSON.parse failed. error message = " + (error && error.message) + " result.response = " + result.response);
                            throw error;
                        }
                    else
                        throw new Error("response was null or empty. status code: " + (result ? result.status : "null"));
                }, _parseInnerProgress: function _parseInnerProgress(result) {
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceServiceQuery_QueryReturn(this.currentChunk);
                    return MSE.Data.queryStatus.processingData
                }, _startInnerExecute: function _startInnerExecute() {
                    var that = this;
                    var returnPromise;
                    if (!this.currentChunk)
                        this.currentChunk = this.createResourceUri();
                    if (this.currentChunk)
                        returnPromise = that._xmlHttpRequest({
                            url: this.currentChunk, async: true, headers: WinJS.Binding.unwrap(this.headers)
                        });
                    else
                        returnPromise = WinJS.Promise.WrapError(this);
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceServiceQuery_QueryStart(this.currentChunk);
                    return returnPromise
                }, _calculateNextChunkKey: function _calculateNextChunkKey(result) {
                    if (result)
                        return this._createUriFromChunkKey(result.nextPage);
                    else
                        return null
                }, _calculatePreviousChunkKey: function _calculatePreviousChunkKey(result) {
                    if (result)
                        return this._createUriFromChunkKey(result.previousPage);
                    else
                        return null
                }, _createUriFromChunkKey: function _createUriFromChunkKey(chunkKey) {
                    var uri = null;
                    var baseUrl = this.createResourceUri();
                    var expression = /\?/;
                    if (expression.test(baseUrl))
                        baseUrl = baseUrl + "&";
                    else
                        baseUrl = baseUrl + "?";
                    if (chunkKey)
                        uri = baseUrl + chunkKey;
                    return uri
                }, _xmlHttpRequest: function _xmlHttpRequest(values) {
                    return MSE.ServiceLocator.getService(MSE.Services.xhr).execute(values)
                }, _endInnerExecute: function _endInnerExecute(result) {
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceServiceQuery_ParseComplete(this.currentChunk)
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Data", {EDSWrapperQuery: WinJS.Class.derive(MSE.Data.ServiceWrapperQuery, function edsServiceWrapperQuery() {
            MS.Entertainment.Data.ServiceWrapperQuery.prototype.constructor.call(this);
            if (MS.Entertainment.Data.EDSWrapperQuery._cachedIsHttps === null)
                MS.Entertainment.Data.EDSWrapperQuery._cachedIsHttps = /^https:\/\//i.test(MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_EDSServiceAuth));
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            var secureEDSEndpointsEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.secureEDSEndpointsEnabled);
            this.shouldAuthenticate = MS.Entertainment.Data.EDSWrapperQuery._cachedIsHttps && secureEDSEndpointsEnabled
        }, {
            serviceType: MS.Entertainment.Data.ServiceWrapperQuery.ServiceTypes.jsonEDS, requestFields: null, deviceType: null, forceSecureEndpoint: false, enabledImpressionGuid: false, impressionGuid: null, _requestFieldsToken: null, _anonymousClientIdHeader: null, _impressionGuids: null, _retryCount: 0, dispose: function dispose() {
                    MS.Entertainment.Data.ServiceWrapperQuery.prototype.dispose.call(this);
                    if (this._impressionGuids)
                        this._impressionGuids.splice(0)
                }, autoUpdateOnSignIn: {
                    get: function() {
                        return this.autoUpdateProperties ? !!this.autoUpdateProperties.isSignedIn : false
                    }, set: function(value) {
                            this.autoUpdateProperties = this.autoUpdateProperties || {};
                            this.autoUpdateProperties.isSignedIn = value
                        }
                }, edsHeaders: {
                    Accept: "application/json", "Content-Type": "application/json", "x-xbl-contract-version": "2.b", "x-xbl-client-type": "X8", "x-xbl-device-type": "WindowsPC", "x-xbl-client-version": "1.0"
                }, createRequestFields: function createRequestFields() {
                    return WinJS.Binding.unwrap(this.requestFields)
                }, createDeviceType: function createDeviceType() {
                    return this.deviceType
                }, createEDSHeaders: function createEDSHeaders() {
                    return WinJS.Binding.unwrap(this.edsHeaders)
                }, getResourceEndpoint: function getResourceEndpoint(edsEndpointType) {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    var secureEdsEndpointsEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.secureEDSEndpointsEnabled);
                    var endpoint;
                    if ((signInService.isSignedIn && (secureEdsEndpointsEnabled || this.forceSecureEndpoint)) || configurationManager.service.enableTimeTravel)
                        endpoint = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_EDSServiceAuth);
                    else
                        endpoint = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_EDSServiceAnon);
                    if (edsEndpointType)
                        endpoint = endpoint + "/" + edsEndpointType;
                    return endpoint
                }, _clearAnonymousClientIdHeader: function _clearAnonymousClientIdHeader() {
                    if (this._anonymousClientIdHeader)
                        this._anonymousClientIdHeader = {
                            key: MS.Entertainment.Data.EDSWrapperQuery.clientIdHeader, value: String.empty
                        }
                }, _createAnonymousClientIdHeader: function _createAnonymousClientIdHeader() {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var visitorId = configurationManager.telemetry.visitorId;
                    if (visitorId)
                        this._anonymousClientIdHeader = {
                            key: MS.Entertainment.Data.EDSWrapperQuery.clientIdHeader, value: visitorId
                        };
                    else
                        this._clearAnonymousClientIdHeader()
                }, _startExecute: function _startExecute() {
                    this._retryCount = 0;
                    if (!this.shouldAuthenticate)
                        if (MS.Entertainment.Data.EDSWrapperQuery._cachedIsHttps && this.forceSecureEndpoint)
                            this.shouldAuthenticate = true
                }, _preInnerExecute: function _preInnerExecute() {
                    var basePromise = MS.Entertainment.Data.ServiceWrapperQuery.prototype._preInnerExecute.apply(this, arguments);
                    var returnPromise = basePromise;
                    this._requestFieldsToken = null;
                    var fieldString;
                    var requestFields = this.createRequestFields();
                    if (Array.isArray(requestFields)) {
                        fieldString = requestFields.join(".");
                        if (MS.Entertainment.Data.EDSWrapperQuery._cachedFieldTokens[fieldString])
                            this._requestFieldsToken = MS.Entertainment.Data.EDSWrapperQuery._cachedFieldTokens[fieldString];
                        else
                            returnPromise = basePromise.then(function executeFieldsQuery() {
                                var query = new MS.Entertainment.Data.EDSFieldQuery;
                                query.fields = fieldString;
                                return query.execute()
                            }.bind(this)).then(function cacheQueryResult(completedQuery) {
                                MS.Entertainment.Data.EDSWrapperQuery._cachedFieldTokens[fieldString] = completedQuery.result.fields;
                                this._requestFieldsToken = completedQuery.result.fields
                            }.bind(this))
                    }
                    return returnPromise
                }, _prepareQueryForInnerExecute: function _prepareQueryForInnerExecute(query) {
                    MS.Entertainment.Data.ServiceWrapperQuery.prototype._prepareQueryForInnerExecute.apply(this, arguments);
                    var value;
                    if (!isNaN(this.chunkSize) && this.chunkSize > 0)
                        query.addParameter(window.encodeURIComponent(MS.Entertainment.Data.EDSWrapperQuery.maxItemsParameter), window.encodeURIComponent(this.chunkSize));
                    if (this._requestFieldsToken)
                        query.addParameter(window.encodeURIComponent(MS.Entertainment.Data.EDSWrapperQuery.fieldsParameter), window.encodeURIComponent(this._requestFieldsToken));
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (configurationManager.service.enableTimeTravel)
                        query.addParameter(window.encodeURIComponent(MS.Entertainment.Data.EDSWrapperQuery.timeTravelInstantParameter), window.encodeURIComponent(configurationManager.service.timeTravelStartDate));
                    var deviceType = this.createDeviceType();
                    if (deviceType)
                        query.addParameter(MS.Entertainment.Data.EDSWrapperQuery.targetDevicesParameter, deviceType);
                    var headers = this.createEDSHeaders();
                    if (headers)
                        for (key in headers)
                            if (headers.hasOwnProperty(key)) {
                                value = headers[key];
                                if (value || value === 0)
                                    query.addHeader(key, value.toString())
                            }
                    if (this.hasAuthenticationHeader())
                        this._clearAnonymousClientIdHeader();
                    else
                        this._createAnonymousClientIdHeader();
                    if (this._anonymousClientIdHeader)
                        query.addHeader(this._anonymousClientIdHeader.key, this._anonymousClientIdHeader.value.toString());
                    if (this.impressionGuid)
                        query.addHeader(MS.Entertainment.Data.EDSWrapperQuery.impressionGuidHeader, this.impressionGuid);
                    else
                        query.removeHeader(MS.Entertainment.Data.EDSWrapperQuery.impressionGuidHeader)
                }, _getResultAugmentation: function _getResultAugmentation() {
                    var resultAugmentation = MSE.Data.ServiceWrapperQuery.prototype._getResultAugmentation.call(this);
                    if (resultAugmentation && this.enabledImpressionGuid) {
                        var callback = this._createNextImpressionGuidCallback();
                        resultAugmentation = MS.Entertainment.Data.AugmentQuery.modifyListResultAugmentation(resultAugmentation, {impressionGuid: callback});
                        resultAugmentation = MS.Entertainment.Data.AugmentQuery.modifyResultAugmentation(resultAugmentation, "item", {impressionGuid: callback})
                    }
                    return resultAugmentation
                }, _initializeImpressionGuids: function _initializeImpressionGuids() {
                    if (!this._disposed && !this._impressionGuids && this.enabledImpressionGuid)
                        this._impressionGuids = []
                }, _createNextImpressionGuidCallback: function _createNextImpressionGuidCallback() {
                    this._initializeImpressionGuids();
                    var impressionGuids = this._impressionGuids;
                    var index = impressionGuids.length;
                    return MS.Entertainment.Data.Property.convert(String.empty, function getImpressionGuid() {
                            return impressionGuids ? impressionGuids[index] : null
                        })
                }, _retryInnerExecute: function _retryInnerExecute(result, error) {
                    var retry = false;
                    if (result && result.ResponseInfo === MS.Entertainment.Data.EDSWrapperQuery.responseInfo.tryAgain && this._retryCount < MS.Entertainment.Data.EDSWrapperQuery._maxRetries) {
                        this._retryCount++;
                        retry = true
                    }
                    return retry
                }, _preInsertChunk: function _preInsertChunk(destination, chunk) {
                    if (this.enabledImpressionGuid && destination && destination.setItemFactory && chunk && chunk.itemFactory)
                        destination.setItemFactory(chunk.itemFactory)
                }, _endInnerExecute: function _endInnerExecute(result) {
                    MS.Entertainment.Data.ServiceWrapperQuery.prototype._endInnerExecute.apply(this, arguments);
                    this._initializeImpressionGuids();
                    if (this._impressionGuids)
                        this._impressionGuids.push(result ? result.impressionGuid : null)
                }
        }, {
            _cachedIsHttps: null, _cachedFieldTokens: {}, _maxRetries: 3, maxItemsParameter: "maxItems", fieldsParameter: "fields", targetDevicesParameter: "targetDevices", timeTravelInstantParameter: "currentTime", clientIdHeader: "x-fd-client", impressionGuidHeader: "x-xbl-ig", responseInfo: {tryAgain: "TryAgain"}
        })});
    WinJS.Namespace.define("MS.Entertainment.Data", {EDSFieldQuery: WinJS.Class.derive(MSE.Data.EDSWrapperQuery, function edsFieldQuery() {
            MS.Entertainment.Data.EDSWrapperQuery.prototype.constructor.call(this)
        }, {
            fields: null, chunkSize: 0, createResourceURI: function() {
                    return this.getResourceEndpoint(MS.Entertainment.Data.Query.edsEndpointType.fields)
                }, createParameters: function createParameters() {
                    return {desired: this.fields}
                }, resultAugmentation: MS.Entertainment.Data.define(null, {fields: MS.Entertainment.Data.Property.alias("Fields", null)})
        })});
    WinJS.Namespace.define("MS.Entertainment.Data", {
        BrowseDetailQuery: WinJS.Class.derive(MS.Entertainment.Data.AggregateQuery, function browseDetailQuery() {
            MS.Entertainment.Data.AggregateQuery.prototype.constructor.apply(this, arguments);
            this.queries.length = 2
        }, {
            browseConstructor: null, detailConstructor: null, executeSequentially: {
                    get: function() {
                        var sequentially = true;
                        if (this.detail && MS.Entertainment.Data.Query && MS.Entertainment.Data.Query.edsIdType && (!this.detail.idType || this.detail.idType === MS.Entertainment.Data.Query.edsIdType.canonical))
                            sequentially = false;
                        return sequentially
                    }, set: function(value) {
                            MSE.Data.fail("Shouldn't set executeSequentially on a BrowseDetailQuery.")
                        }
                }, chunked: {
                    get: function() {
                        return false
                    }, set: function(value) {
                            MSE.Data.fail("Shouldn't set chunked on a BrowseDetailQuery.")
                        }
                }, browse: {get: function() {
                        if (!this.browseConstructor)
                            return null;
                        if (!this.queries[1])
                            this.queries[1] = new this.browseConstructor;
                        return this.queries[1]
                    }}, detail: {get: function() {
                        if (!this.detailConstructor)
                            return null;
                        if (!this.queries[0])
                            this.queries[0] = new this.detailConstructor;
                        return this.queries[0]
                    }}, impressionGuid: {
                    get: function getImpressionGuid() {
                        return this.browse ? this.browse.impressionGuid : null
                    }, set: function setImpressionGuid(value) {
                            if (this.browse && "impressionGuid" in this.browse)
                                this.browse.impressionGuid = value;
                            if (this.detail && "impressionGuid" in this.detail)
                                this.detail.impressionGuid = value
                        }
                }, _preInnerExecute: function _preInnerExecute() {
                    var browseQuery = this.browse;
                    var detailsQuery = this.detail;
                    return WinJS.Promise.as()
                }, _handleIntermediateResult: function _handleIntermediateResult(sourceIndex, sourceResult) {
                    if (sourceIndex === 0 && sourceResult.item && (sourceResult.item.canonicalId || sourceResult.item.serviceId) && this.browse) {
                        this.browse.impressionGuid = sourceResult.item.impressionGuid;
                        this.browse.id = sourceResult.item.canonicalId || sourceResult.item.serviceId;
                        this.browse.idType = sourceResult.item.canonicalId ? MS.Entertainment.Data.Query.edsIdType.canonical : MS.Entertainment.Data.Query.edsIdType.zuneCatalog
                    }
                }
        }, {mixAugmentation: function mixAugmentation(browseAugmentation, detailAugmentation) {
                var augmentations = {};
                augmentations["source[0]"] = detailAugmentation;
                augmentations["source[1]"] = browseAugmentation;
                return MS.Entertainment.Data.mix(augmentations)
            }}), AugmentationWrapperQuery: WinJS.Class.derive(MSE.Data.MainQuery, function AugmentationWrapperQuery(query) {
                MSE.Data.MainQuery.prototype.constructor.apply(this, arguments);
                this.query = query
            }, {
                _query: null, _queryNotify: null, _queryEvents: null, autoDisposeQuery: true, query: {
                        get: function() {
                            return this._query
                        }, set: function(value) {
                                if (this.value !== this._query) {
                                    if (this._query) {
                                        this._query.notify = this._queryNotify;
                                        this._queryNotify = null
                                    }
                                    if (this._queryEvents) {
                                        this._queryEvents.cancel();
                                        this._queryEvents = null
                                    }
                                    this._query = value;
                                    if (this._query) {
                                        this._queryNotify = this._query.notify;
                                        this._query.notify = this._notifyProxy.bind(this);
                                        this._queryEvents = MS.Entertainment.Utilities.addEvents(this._query, {resultChanged: this._queryResultChanged.bind(this)})
                                    }
                                }
                            }
                    }, clearResultOnFailure: {
                        get: function() {
                            return this.query ? this.query.clearResultOnFailure : false
                        }, set: function(value) {
                                if (this.query)
                                    this.query.clearResultOnFailure = value
                            }
                    }, enabled: {
                        get: function() {
                            return this.query ? this.query.enabled : false
                        }, set: function(value) {
                                if (this.query)
                                    this.query.enabled = value
                            }
                    }, status: {
                        get: function() {
                            return this.query ? this.query.status : MSE.Data.queryStatus.idle
                        }, set: function(value) {
                                if (this.query)
                                    this.query.status = value
                            }
                    }, cookie: {
                        get: function() {
                            return this.query ? this.query.cookie : null
                        }, set: function(value) {
                                if (this.query)
                                    this.query.cookie = value
                            }
                    }, errorCode: {
                        get: function() {
                            return this.query ? this.query.errorCode : null
                        }, set: function(value) {
                                if (this.query)
                                    this.query.errorCode = value
                            }
                    }, errorObject: {
                        get: function() {
                            return this.query ? this.query.errorObject : null
                        }, set: function(value) {
                                if (this.query)
                                    this.query.errorObject = value
                            }
                    }, result: {
                        get: function() {
                            return this.query ? this.query.result : null
                        }, set: function(value) {
                                if (this.query && this.query.result)
                                    this.query.result = value
                            }
                    }, totalCount: {
                        get: function() {
                            return this.query ? this.query.totalCount : null
                        }, set: function(value) {
                                if (this.query)
                                    this.query.totalCount = value
                            }
                    }, impressionGuid: {
                        get: function getImpressionGuid() {
                            return this.query ? this.query.impressionGuid : null
                        }, set: function setImpressionGuid(value) {
                                if (this.query && "impressionGuid" in this.query)
                                    this.query.impressionGuid = value
                            }
                    }, lastChunkedResult: {
                        get: function() {
                            return this.query ? this.query.lastChunkedResult : null
                        }, set: function(value) {
                                if (this.query)
                                    this.query.lastChunkedResult = value
                            }
                    }, resultFactory: {
                        get: function() {
                            return this.query ? this.query.resultFactory : null
                        }, set: function(value) {
                                if (this.query)
                                    this.query.resultFactory = value
                            }
                    }, resultAugmentation: {
                        get: function() {
                            return this.query ? this.query.resultAugmentation : null
                        }, set: function(value) {
                                if (this.query)
                                    this.query.resultAugmentation = value
                            }
                    }, aggregateChunks: {
                        get: function() {
                            return this.query ? this.query.aggregateChunks : false
                        }, set: function(value) {
                                if (this.query)
                                    this.query.aggregateChunks = value
                            }
                    }, chunked: {
                        get: function() {
                            return this.query ? this.query.chunked : false
                        }, set: function(value) {
                                if (this.query)
                                    this.query.chunked = value
                            }
                    }, chunkSize: {
                        get: function() {
                            return this.query ? this.query.chunkSize : 0
                        }, set: function(value) {
                                if (this.query)
                                    this.query.chunkSize = value
                            }
                    }, currentChunk: {
                        get: function() {
                            return this.query ? this.query.currentChunk : null
                        }, set: function(value) {
                                if (this.query)
                                    this.query.currentChunk = value
                            }
                    }, nextChunk: {get: function() {
                            return this.query ? this.query.nextChunk : null
                        }}, previousChunk: {get: function() {
                            return this.query ? this.query.previousChunk : null
                        }}, hasNextChunk: {get: function() {
                            return this.query ? this.query.hasNextChunk : null
                        }}, hasPreviousChunk: {get: function() {
                            return this.query ? this.query.hasPreviousChunk : null
                        }}, isLoadingFromStart: {get: function() {
                            return this.query ? this.query.isLoadingFromStart : null
                        }}, isDisposed: {get: function() {
                            return this.query ? this.query.isDisposed : false
                        }}, dispose: function dispose() {
                        if (this.query && this.autoDisposeQuery) {
                            this.query.dispose();
                            this.query = null
                        }
                        if (this._queryEvents) {
                            this._queryEvents.cancel();
                            this._queryEvents = null
                        }
                    }, execute: function execute(cookie) {
                        var result;
                        if (this.query)
                            result = this.query.execute(cookie);
                        else
                            result = WinJS.Promise.wrapError(new Error("Invalid state for executing. The query property was not set to a valid value."));
                        return result
                    }, loadPreviousChunk: function loadPreviousChunk() {
                        var result;
                        if (this.query)
                            result = this.query.loadPreviousChunk();
                        else
                            result = WinJS.Promise.wrapError(new Error("Invalid state for loading previous chunk. The query property was not set to a valid value."));
                        return result
                    }, loadNextChunk: function loadNextChunk() {
                        var result;
                        if (this.query)
                            result = this.query.loadNextChunk();
                        else
                            result = WinJS.Promise.wrapError(new Error("Invalid state for loading next chunk. The query property was not set to a valid value."));
                        return result
                    }, isValidChunk: function isValidChunk(chunk) {
                        var result;
                        if (this.query)
                            result = this.query.isValidChunk(chunk);
                        else
                            result = false;
                        return result
                    }, _notifyProxy: function _notifyProxy(name, value, oldValue) {
                        if (this._queryNotify && this.query)
                            this._queryNotify.apply(this.query, arguments);
                        this.notify(name, value, oldValue)
                    }, _queryResultChanged: function _queryResultChanged(args) {
                        if (args && args.detail)
                            this.dispatchEvent(MS.Entertainment.Data.MainQuery.events.resultChanged, {
                                sender: this, result: args.detail.result, totalCount: args.detail.totalCount, error: args.detail.error
                            })
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Data", {
        PlaybackQuery: WinJS.Class.derive(MSE.Data.AugmentationWrapperQuery, function PlaybackQuery(query) {
            MSE.Data.AugmentationWrapperQuery.prototype.constructor.call(this, query)
        }, {
            _playbackSessionBindings: null, _hasStarted: false, _playbackOptions: null, aggregateChunks: {
                    get: function() {
                        return false
                    }, set: function(value){}
                }, chunked: {
                    get: function() {
                        return false
                    }, set: function(value){}
                }, dispose: function dispose() {
                    MSE.Data.AugmentationWrapperQuery.prototype.dispose.apply(this);
                    this._unbindPrimaryPlaybackSession();
                    this._playbackOptions = null
                }, execute: function execute(cookie) {
                    if (this.isDisposed)
                        return;
                    this._hasStarted = false;
                    this._playbackOptions = this._getPlaybackOptions();
                    this._prepareInnerQuery();
                    var result = MSE.Data.AugmentationWrapperQuery.prototype.execute.call(this, cookie);
                    return result.then(function executeCompleted(promiseResult) {
                            this._bindPrimaryPlaybackSession();
                            return promiseResult
                        }.bind(this))
                }, _loadNextChunk: function _loadNextChunk() {
                    if (this.isDisposed)
                        return;
                    this._prepareInnerQuery();
                    var result = MSE.Data.AugmentationWrapperQuery.prototype.loadNextChunk.call(this);
                    return result.then(function(promiseResult) {
                            var list = this._getChunkDestination();
                            var options = this._getPlaybackOptions();
                            if (list && !this.isDisposed && this._playbackOptions.smartDJSeed === options.smartDJSeed)
                                MS.Entertainment.Platform.PlaybackHelpers.playMedia2(list, this._playbackOptions);
                            else if (!this.isDisposed)
                                this.dispose();
                            return promiseResult
                        }.bind(this))
                }, _bindPrimaryPlaybackSession: function _bindPrimaryPlaybackSession() {
                    if (this._playbackSessionBindings || this.isDisposed)
                        return;
                    var sessionId = MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying;
                    var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    if (sessionManager && sessionManager.primarySession && sessionManager.primarySession.sessionId === sessionId)
                        this._playbackSessionBindings = WinJS.Binding.bind(sessionManager.primarySession, {
                            currentTransportState: this._onCurrentTransportStateChanged.bind(this), currentOrdinal: this._onCurrentOrdinalChanged.bind(this), playerState: this._onCurrentPlayerStateChanged.bind(this), currentMedia: this._onCurrentPlayerStateChanged.bind(this)
                        })
                }, _unbindPrimaryPlaybackSession: function _unbindPrimaryPlaybackSession() {
                    if (this._playbackSessionBindings) {
                        this._playbackSessionBindings.cancel();
                        this._playbackSessionBindings = null
                    }
                }, _onCurrentTransportStateChanged: function _onCurrentTransportStateChanged(newValue) {
                    if (!this._hasStarted)
                        this._hasStarted = newValue !== MS.Entertainment.Platform.Playback.TransportState.stopped;
                    if (!this._hasStarted || this.isDisposed || !this._playbackSessionBindings)
                        return;
                    if (newValue === MS.Entertainment.Platform.Playback.TransportState.stopped)
                        this.dispose()
                }, _onCurrentOrdinalChanged: function _onCurrentOrdinalChanged(newValue) {
                    if (this.isDisposed || !this._playbackSessionBindings)
                        return;
                    var sessionManager = this._getValidSessionManager();
                    if (sessionManager)
                        sessionManager.primarySession.mediaCollection.getCount().then(function gotCount(count) {
                            if (newValue + 1 >= count)
                                this._loadNextChunk()
                        }.bind(this))
                }, _onCurrentPlayerStateChanged: function _onCurrentPlayerStateChanged() {
                    if (this.isDisposed || !this._playbackSessionBindings)
                        return;
                    var sessionManager = this._getValidSessionManager();
                    if (sessionManager && sessionManager.primarySession && sessionManager.primarySession.playerState === MS.Entertainment.Platform.Playback.PlayerState.error)
                        this._loadNextChunk()
                }, _getValidSessionManager: function _getValidSessionManager() {
                    var sessionId = MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying;
                    var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    if (!sessionManager || !sessionManager.primarySession || sessionManager.primarySession.sessionId !== sessionId || !sessionManager.primarySession.mediaCollection)
                        sessionManager = null;
                    return sessionManager
                }, _prepareInnerQuery: function _prepareInnerQuery() {
                    if (this.query)
                        this.query.aggregateChunks = false
                }, _getPlaybackOptions: function _getPlaybackOptions() {
                    var sessionId = MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying;
                    var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var playbackSession = sessionManager.primarySession || {};
                    return {
                            autoPlay: true, preservePlayContext: true, queueMedia: true, smartDJSeed: playbackSession.smartDJSeed, sessionId: sessionId
                        }
                }, _getChunkDestination: function _getChunkDestination() {
                    var result = null;
                    if (this.query)
                        result = this.query._getChunkDestination();
                    return result
                }
        }), ModelQuery: WinJS.Class.derive(MSE.Data.AugmentQuery, function() {
                MSE.Data.AugmentQuery.prototype.constructor.apply(this, arguments)
            }, {
                _innerQuery: null, chunkSize: 0, currentIndex: {get: function() {
                            return (typeof this.currentChunk === "number" ? this.currentChunk : 0)
                        }}, createModel: function createModel(startIndex, count) {
                        return null
                    }, createAsyncModel: function createAsyncModel(startIndex, count) {
                        return null
                    }, _parseInnerProgress: function _parseInnerProgress(result) {
                        return MSE.Data.queryStatus.processingData
                    }, _startInnerExecute: function _startInnerExecute() {
                        var that = this;
                        var requestPromise,
                            model;
                        var asyncModel = this.createAsyncModel(this.currentIndex, this.chunkSize);
                        if (asyncModel)
                            requestPromise = asyncModel;
                        else {
                            model = this.createModel(this.currentIndex, this.chunkSize);
                            if (model)
                                requestPromise = WinJS.Promise.wrap(model)
                        }
                        if (!requestPromise)
                            requestPromise = WinJS.Promise.wrapError(this);
                        return requestPromise
                    }, _getChunkResultSize: function _getChunkResultSize(result) {
                        return (result && result.items && result.items.source) ? result.items.source.length : 0
                    }, _calculateNextChunkKey: function _calculateNextChunkKey(result) {
                        var resultSize = this._getChunkResultSize(result);
                        if (resultSize && this.chunkSize && resultSize >= this.chunkSize)
                            return this.currentIndex + resultSize;
                        else
                            return null
                    }, _calculatePreviousChunkKey: function _calculatePreviousChunkKey(result) {
                        var resultSize = this._getChunkResultSize(result);
                        if (resultSize && this.currentIndex > this.chunkSize && this.chunkSize)
                            return Math.max(0, this.currentIndex - this.chunkSize);
                        else
                            return null
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Data", {QueryDebugger: WinJS.Class.define(null, {}, {
            queryType: {
                image: "image", service: "service", database: "database"
            }, logQuery: (function() {
                    return function logQuery(){}
                })()
        })})
})()
