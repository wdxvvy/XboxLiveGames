/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Social");
(function(MSE, undefined) {
    WinJS.Namespace.defineWithParent(MSE, "Social", {
        ShareMetadata: WinJS.Binding.define({
            title: null, description: null, text: null, serviceId: -1, serviceType: null
        }), ShareEncoderFactory: WinJS.Class.define(function shareEncoderFactory() {
                this._encoders = []
            }, {
                _encoders: null, encode: function encode(data, result) {
                        var encoder = this.find(data);
                        if (encoder)
                            return encoder(data, result);
                        else
                            MSE.Social.fail("Could not find an encoder that could encode the given data")
                    }, find: function find(data) {
                        var length = this._encoders.length;
                        var encoder;
                        for (var i = 0; i < length; i++)
                            if (this._encoders[i].canEncode(data)) {
                                encoder = this._encoders[i].encoder;
                                break
                            }
                        return encoder
                    }, register: function register(canEncode, encoder) {
                        var hash,
                            exists;
                        if (!canEncode)
                            throw new Error("canEncode callback wasn't defined");
                        if (!encoder)
                            throw new Error("encoder callback wasn't defined");
                        this._encoders.push({
                            canEncode: canEncode, encoder: encoder
                        })
                    }, deregister: function deregister(encoder) {
                        var length = this._encoders.length;
                        var index = -1;
                        for (var i = 0; i < length; i++)
                            if (this._encoders[i].encoder === encoder) {
                                index = i;
                                break
                            }
                        if (index < 0)
                            MSE.Social.assert(false, "Couldn't find the given encoder within the collection");
                        else
                            this._encoders.splice(index, 1)
                    }
            }), ShareDecoderFactory: WinJS.Class.define(function shareDecoderFactory() {
                this._decoders = []
            }, {
                _decoders: null, decode: function decode(data) {
                        var length = this._decoders.length;
                        var found = false;
                        var result = null;
                        for (var i = 0; i < length; i++)
                            if (this._decoders[i].canDecode(data)) {
                                result = this._decoders[i].decode(data);
                                found = true;
                                break
                            }
                        MSE.Social.assert(found, "Could not find a decoder that could decode the given data");
                        return result
                    }, register: function register(canDecode, decoder) {
                        if (!canDecode)
                            throw new Error("canDecode callback wasn't defined");
                        if (!decoder)
                            throw new Error("decoder callback wasn't defined");
                        this._decoders.push({
                            canDecode: canDecode, decode: decoder
                        })
                    }, deregister: function deregister(decoder) {
                        var length = this._decoders.length;
                        var index = -1;
                        for (var i = 0; i < length; i++)
                            if (this._decoders[i].decoder === decoder) {
                                index = i;
                                break
                            }
                        if (index < 0)
                            MSE.Social.assert(false, "Couldn't find the given decoder within the collection");
                        else
                            this._decoders.splice(index, 1)
                    }
            })
    });
    MSE.ServiceLocator.register(MSE.Services.shareEncoder, function createShareEncoder() {
        return new MSE.Social.ShareEncoderFactory
    });
    MSE.ServiceLocator.register(MSE.Services.shareDecoder, function createShareDecoder() {
        var shareDecoderFactory = new MSE.Social.ShareDecoderFactory;
        shareDecoderFactory.register(function canDecode(sharePackage) {
            if (sharePackage !== null && sharePackage !== undefined)
                return true;
            else
                return false
        }, function decode(sharePackage) {
            var metadata = new MSE.Social.ShareMetadata;
            metadata.text = sharePackage.text;
            metadata.title = sharePackage.mediaTitle;
            metadata.description = sharePackage.mediaDescription;
            metadata.serviceId = sharePackage.mediaId;
            metadata.serviceType = sharePackage.mediaType;
            if (!metadata.title)
                metadata.title = sharePackage.title || "";
            if (!metadata.description)
                metadata.description = sharePackage.description || "";
            if (!metadata.text)
                metadata.text = metadata.title;
            return metadata
        });
        return shareDecoderFactory
    })
})(WinJS.Namespace.define("MS.Entertainment", null))
