#target photoshop

// Replace SmartObject’s Content and Save as JPG
// 2017, use it at your own risk
// Via @Circle B: https://graphicdesign.stackexchange.com/questions/92796/replacing-a-smart-object-in-bulk-with-photoshops-variable-data-or-scripts/93359
// JPG code from here: https://forums.adobe.com/thread/737789

// Worked on Adobe Photoshop CC 2018

const MOCKUP_PATH = '/Users/aigarscibulskis/Documents/AERNS Mobile Cases/Test Automation/mockups';
const SOURCE_ASSETS_PATH = '/Users/aigarscibulskis/Documents/AERNS Mobile Cases/Test Automation/assets/source';
const GENERATED_ASSETS_PATH = '/Users/aigarscibulskis/Documents/AERNS Mobile Cases/Test Automation/assets/generated';

const mockupFolder = Folder(MOCKUP_PATH)
const sourceAssetsFolder = Folder(SOURCE_ASSETS_PATH)

const mockupFiles = mockupFolder.getFiles(function(f) {
  return (
    f instanceof File
    && f.name.match(/\.(psd)$/i) !== null
  );
});

const assetFiles = sourceAssetsFolder.getFiles(function(f) {
  return (
    f instanceof File
    && f.name.match(/\.(png|tif|jpg)$/i) !== null
  );
});


// CANVAS_SIZE [width, height]
const CANVAS_SIZE = [1173, 2352]

// JPEG Saving options
const jpgSaveOptions = new JPEGSaveOptions();
jpgSaveOptions.embedColorProfile = true;
jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
jpgSaveOptions.matte = MatteType.NONE;
jpgSaveOptions.quality = 12;

for (var i = 0; i < mockupFiles.length; i++) {
  var mockupDocument = app.open(mockupFiles[i]);
  var documentSmartObjectLayer = findSmartObjectLayer(mockupDocument);

  if (documentSmartObjectLayer === undefined) {
    mockupDocument.close(SaveOptions.DONOTSAVECHANGES);
    continue;
  }


  var theName = mockupDocument.name.match(/(.*)\.[^\.]+$/)[1];

  for (var m = 0; m < assetFiles.length; m++) {
    // Replace SmartObject
    replaceContents(assetFiles[m], mockupDocument, documentSmartObjectLayer);
    var theNewName = assetFiles[m].name.match(/(.*)\.[^\.]+$/)[1];
    // Save JPG
    mockupDocument.saveAs((new File(GENERATED_ASSETS_PATH + "/" + theName + "_" + theNewName + ".jpg")), jpgSaveOptions, true, Extension.LOWERCASE);
  }

  mockupDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function findSmartObjectLayer(mockupDocument) {
  for (var i = 0; i < mockupDocument.layers.length; i++) {
    var layer = mockupDocument.layers[i];
    if (layer.kind === LayerKind.SMARTOBJECT) {
      return layer;
    }
  }

  return undefined;
}

// Replace SmartObject Contents
function replaceContents(newFile, mockupDocument, smartObjectLayer) {
  mockupDocument.activeLayer = smartObjectLayer;

  var d = new ActionDescriptor();
  d.putPath(charIDToTypeID("null"), new File(newFile));
  d.putInteger(charIDToTypeID("PgNm"), 1);

  executeAction(stringIDToTypeID("placedLayerReplaceContents"), d, DialogModes.NO);
};
