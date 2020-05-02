function replace_mockup(layer_name, scale, alignment, file) {
  try {
    var doc = app.activeDocument;

    if (!select_layer(layer_name)) {
      alert("Can't select layer: " + layer_name, "Error", true);
      return false;
    }

    if (doc.activeLayer.kind !== LayerKind.SMARTOBJECT) {
      alert("Selected layer is not a smart object", "Error", true);
      return false;
    }

    app.preferences.rulerUnits = Units.PIXELS;

    var doc_len = app.documents.length;
    executeAction(stringIDToTypeID("placedLayerEditContents"), undefined, DialogModes.ERROR);
    if (doc_len == app.documents.length) { alert("Failed: placedLayerEditContents", "Error", true); return false; }

    var doc1 = app.activeDocument;

    var w0 = doc1.width.value;
    var h0 = doc1.height.value;

    var tmp = app.open(file);

    tmp.artLayers.add();
    var d = new ActionDescriptor();
    d.putBoolean(stringIDToTypeID("duplicate"), true);
    executeAction(stringIDToTypeID("mergeVisible"), d, DialogModes.NO);

    var w1 = tmp.width.value;
    var h1 = tmp.height.value;

    if (w0/w1 > h0/h1) tmp.resizeImage(w0, w0/w1*h1, doc.resolution, ResampleMethod.BICUBIC);
    else               tmp.resizeImage(h0/h1*w1, h0, doc.resolution, ResampleMethod.BICUBIC);

    tmp.activeLayer.duplicate(doc1.layers[0], ElementPlacement.PLACEBEFORE);

    tmp.close(SaveOptions.DONOTSAVECHANGES);
    activeDocument = doc1;

    var d = new ActionDescriptor();
    var list = new ActionList();
    var r = new ActionReference();
    r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
    list.putReference(r);
    d.putList(stringIDToTypeID("null"), list);
    d.putBoolean(stringIDToTypeID("toggleOthers"), true);
    executeAction(stringIDToTypeID("show"), d, DialogModes.NO);

    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("hidden"));
    d.putReference(stringIDToTypeID("null"), r);
    executeAction(stringIDToTypeID("delete"), d, DialogModes.NO);

    // ALIGN
    doc1.activeLayer.translate(w0/2 - (doc1.activeLayer.bounds[2].value+doc1.activeLayer.bounds[0].value)/2, h0/2-(doc1.activeLayer.bounds[3].value+doc1.activeLayer.bounds[1].value)/2);

    doc1.activeLayer.resize(UnitValue(scale, "%"), UnitValue(scale, "%"));

    doc1.close(SaveOptions.SAVECHANGES);
    app.activeDocument = doc;

    return true;
  }
  catch (e) {
    alert(e);
    return false;
  }
}
