import { TagDict, TagValue } from "./Message";
import TagData from "./TagData";

/**
 * The validate(dict) method will do some type checking against value representations.
 * The returned result will be a list of IValidatorWarnings, which are composed of
 * a level, which indicates severity, with 1 being a fatal error, 2 being a possible
 * information leak, and 3 being any abnormality, and a text description.
 **/

export interface IValidatorWarning {
  level: number;
  text: string;
}

export function supportedSOPClasses(): string[] {
  return [
    "1.2.840.10008.5.1.4.1.1.1.1", // Digital X-Ray Image - For Presentation
    "1.2.840.10008.5.1.4.1.1.1.1.1", // Digital X-Ray Image - For Processing
    "1.2.840.10008.5.1.4.1.1.1.2", // Digital Mammography X-Ray Image - For Presentation
    "1.2.840.10008.5.1.4.1.1.1.2.1", // Digital Mammography X-Ray Image - For Processing
    "1.2.840.10008.5.1.4.1.1.2", // CT Image
    //"1.2.840.10008.5.1.4.1.1.2.1", // Enhanced CT Image
    //"1.2.840.10008.5.1.4.1.1.2.2", // Legacy Converted Enhanced CT Image
    "1.2.840.10008.5.1.4.1.1.3.1", // Ultrasound Multi-frame Image
    "1.2.840.10008.5.1.4.1.1.4", // MR Image
    //"1.2.840.10008.5.1.4.1.1.4.1", // Enhanced MR Image
    "1.2.840.10008.5.1.4.1.1.4.2", // MR Spectroscopy
    //"1.2.840.10008.5.1.4.1.1.4.3", // Enhanced MR Color Image
    "1.2.840.10008.5.1.4.1.1.6.1", // Ultrasound Image
    "1.2.840.10008.5.1.4.1.1.12.1", // X-Ray Angiographic Image
    //"1.2.840.10008.5.1.4.1.1.12.1.1", // Enhanced XA Image
    "1.2.840.10008.5.1.4.1.1.12.2", // X-Ray Radiofluoroscopic Image
    "1.2.840.10008.5.1.4.1.1.13.1.1", // X-Ray 3D Angiographic Image
    "1.2.840.10008.5.1.4.1.1.20", // Nuclear Medicine Image
    "1.2.840.10008.5.1.4.1.1.128", // Positron Emission Tomography Image
    //"1.2.840.10008.5.1.4.1.1.130", // Enhanced PET Image
    //"1.2.840.10008.5.1.4.1.1.128.1" // Legacy Converted Enhanced PET Image
  ];
}

function validateAplicationEntityVR(tag: TagValue): IValidatorWarning[] {
  //let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  // This is a pretty broadly defined VR
  return warnings;
}

// We shouldn't see age string values in anonymized datasets.
function validateAgeStringVR(tag: TagValue): IValidatorWarning[] {
  let values = tag.Value;

  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    const value = values[i]
    if (typeof value === "string" && value.length > 0 && !value.match(/^\d{1-3}Y$/)) {
      warnings.push({
        level: 1,
        text: "Anonymised data should not include age data.",
      });
    }
  }
  return warnings;
}

function validateAttributeTagVR(tag: TagValue): IValidatorWarning[] {
  let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    const value = values[i]
    if (typeof value === "string" && !(value in TagData)) {
      warnings.push({
        level: 3,
        text: values[i] + " was not an expected attribute tag.",
      });
    }
  }
  return warnings;
}

function validateCodeStringVR(tag: TagValue): IValidatorWarning[] {
  let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    // Code string values should be uppercase.
    const value = values[i]
    if (typeof value === "string" && /[a-z]/.test(value)) {
      warnings.push({
        level: 3,
        text: values[i] + " is not an expected value for codestring",
      });
    }
  }
  return warnings;
}

//YYYYMMDD
function validateDateVR(tag: TagValue): IValidatorWarning[] {
  let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    // Code string values should be uppercase.
    if (values[i] != "19700101") {
      warnings.push({
        level: 2,
        text:
          values[i] +
          " is a date that has not been replaced with 19700101 by the policy. This may include personal information",
      });
    }
  }
  return warnings;
}

function validateDecimalStringVR(tag: TagValue): IValidatorWarning[] {
  let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    const value = values[i]
    // Valid chars are 0-9, e, E - +
    // Just a quick test for bad chars.
    if (typeof value === "string" && (
      /[a-d]/.test(value) ||
      /[f-z]/.test(value) ||
      /[A-D]/.test(value) ||
      /[F-Z]/.test(value)
    )) {
      warnings.push({
        level: 3,
        text: value + " is not an expected value for a decimal string",
      });
    }
    // ASCII length of the tag value for DS should be up to 16 chars
    if (typeof value === "string" && value.length > 16) {
      warnings.push({ level: 3, text: `DecimalString VR is limited to 16 chars ('${value}' is ${value.length} bytes).` })
    }
  }
  return warnings;
}

function validateDateTimeVR(tag: TagValue): IValidatorWarning[] {
  let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    // Code string values should be uppercase.
    if (values[i] != "19700101000000.000000") {
      warnings.push({
        level: 2,
        text:
          values[i] +
          " is a datetime that has not been replaced with 19700101000000.000000 by the policy. This may include personal information",
      });
    }
  }
  return warnings;
}

function validateFloatingPointSingleVR(tag: TagValue): IValidatorWarning[] {
  //TODO (Probably a cast?)
  return Array<IValidatorWarning>();
}

function validateFloatingPointDoubleVR(tag: TagValue): IValidatorWarning[] {
  //TODO (Probably a cast?)
  return Array<IValidatorWarning>();
}

function validateIntegerStringVR(tag: TagValue): IValidatorWarning[] {
  let warnings = Array<IValidatorWarning>();
  let values = tag["Value"];
  for (var i = 0; i < values.length; i++) {
    const value = values[i]
    // Valid chars are 0-9, e, E - +
    // Just a quick test for bad chars.
    if (typeof value === "string" && (
      /[a-d]/.test(value) ||
      /[f-z]/.test(value) ||
      /[A-D]/.test(value) ||
      /[F-Z]/.test(value)
    )) {
      warnings.push({
        level: 3,
        text: value + " is not an expected value for a integer string",
      });
    }
  }
  return warnings;
}

function validateLongStringVR(tag: TagValue): IValidatorWarning[] {
  let warnings = Array<IValidatorWarning>();
  let values = tag["Value"];
  for (var i = 0; i < values.length; i++) {
    // Valid chars are 0-9, e, E - +
    // Just a quick test for bad chars.
    warnings.push({
      level: 4,
      text: "Long strings may include personal data.",
    });
  }
  return warnings;
}

/// The "Other X" types are all (by design) pretty wide open byte streams with
/// arbitrary encoding schemes. Not much we can do to check...
function validateOtherByteVR(tag: TagValue): IValidatorWarning[] {
  return Array<IValidatorWarning>();
}

function validateOtherDoubleStringVR(tag: TagValue): IValidatorWarning[] {
  return Array<IValidatorWarning>();
}

function validateOtherFloatStringVR(tag: TagValue): IValidatorWarning[] {
  return Array<IValidatorWarning>();
}

function validateOtherWordStringVR(tag: TagValue): IValidatorWarning[] {
  return Array<IValidatorWarning>();
}

function validatePersonNameVR(tag: TagValue): IValidatorWarning[] {
  let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    const value = values[i]
    if (typeof value === "string" && value.length > 0) {
      warnings.push({
        level: 1,
        text:
          value +
          " is a person name and should not be included in Anonymised data",
      });
    }
  }

  return warnings;
}

function validateShortStringVR(tag: TagValue): IValidatorWarning[] {
  let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    const value = values[i]
    if (typeof value === "string" && value.trim.length > 16) {
      warnings.push({
        level: 3,
        text: values[i] + " has more data than expected for a short string.",
      });
    }
  }

  return warnings;
}

function validateSignedLongVR(tag: TagValue): IValidatorWarning[] {
  //TODO (Probably a cast?)
  return Array<IValidatorWarning>();
}

function validateSequenceVR(tag: TagValue): IValidatorWarning[] {
  //Not going to get into recurssive structures...
  return Array<IValidatorWarning>();
}

function validateSignedShortVR(tag: TagValue): IValidatorWarning[] {
  //TODO (Probably a cast?)
  return Array<IValidatorWarning>();
}

function validateShortTextVR(tag: TagValue): IValidatorWarning[] {
  let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    const value = values[i]
    if (typeof value === "string" && value.trim.length > 1024) {
      warnings.push({
        level: 3,
        text: values[i] + " has more data than expected for a short text.",
      });
    }
  }

  return warnings;
}

function validateTimeVR(tag: TagValue): IValidatorWarning[] {
  let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    const value = values[i]
    // Just a quick test for bad chars.
    if ((typeof value === "string") && (
      /[a-d]/.test(value) ||
      /[f-z]/.test(value) ||
      /[A-D]/.test(value) ||
      /[F-Z]/.test(value)
    )) {
      warnings.push({
        level: 3,
        text: value + " is not an expected value for a time string",
      });
    }
  }
  return warnings;
}

function validateUIDVR(tag: TagValue): IValidatorWarning[] {
  let values = tag["Value"];
  let warnings = Array<IValidatorWarning>();
  for (var i = 0; i < values.length; i++) {
    // Just a quick test for bad chars.
    const value = values[i];
    if ((typeof value === "string") && (/[a-z]/.test(value) || /[A-Z]/.test(value))) {
      warnings.push({
        level: 3,
        text: value + " is not an expected value for a UID",
      });
    }
  }

  return warnings;
}

function validateUnsignedLongVR(tag: TagValue): IValidatorWarning[] {
  //TODO (Probably a cast?)
  return Array<IValidatorWarning>();
}

function validateUnsignedShortVR(tag: TagValue): IValidatorWarning[] {
  //TODO (Probably a cast?)
  return Array<IValidatorWarning>();
}

function validateUndefinedVR(tag: TagValue): IValidatorWarning[] {
  var warnings = Array<IValidatorWarning>();
  warnings.push({ level: 3, text: "Tag's VR field is undefined" });
  return warnings;
}

//function checkMultiplicity(tag): IValidatorWarning[]{
//  //TODO
//  return  Array<IValidatorWarning>();
//};

let validateDict: {
  [kind: string]: (tag: TagValue) => Array<IValidatorWarning>;
} = {
  AE: validateAplicationEntityVR,
  AS: validateAgeStringVR,
  AR: validateAttributeTagVR,
  CS: validateCodeStringVR,
  DA: validateDateVR,
  DS: validateDecimalStringVR,
  DT: validateDateTimeVR,
  FL: validateFloatingPointSingleVR,
  FD: validateFloatingPointDoubleVR,
  IS: validateIntegerStringVR,
  LO: validateLongStringVR,
  OB: validateOtherByteVR,
  OD: validateOtherDoubleStringVR,
  OF: validateOtherFloatStringVR,
  OW: validateOtherWordStringVR,
  PN: validatePersonNameVR,
  SH: validateShortStringVR,
  SL: validateSignedLongVR,
  SQ: validateSequenceVR,
  SS: validateSignedShortVR,
  ST: validateShortTextVR,
  TM: validateTimeVR,
  UI: validateUIDVR,
  UL: validateUnsignedLongVR,
  US: validateUnsignedShortVR,
  undefined: validateUndefinedVR,
};

type Warnings = { [x: string]: Array<IValidatorWarning> };
export default function validate(dcm: TagDict): Warnings {
  var warnings: Warnings = {};
  for (const key of Object.keys(dcm)) {
    var vrKey: string = dcm[key]["vr"];
    if (validateDict[vrKey]) {
      var warningsList = validateDict[vrKey](dcm[key]);
      warnings[key] = warningsList;

      // Check if the annotations are burnt in:
      if (key == "00280301") {
        var values = dcm[key]["Value"];
        for (var i = 0; i < values.length; i++) {
          // Just a quick test for bad chars.
          if (values[i] != "NO") {
            warnings["00280301"] = [
              {
                level: 1,
                text:
                  "Image contains burnt-in annotations which cannot be anonymized.",
              },
            ];
          }
        }
      }

      // Check if the there are recognizable features
      if (key == "00280302") {
        var values = dcm[key]["Value"];
        for (var i = 0; i < values.length; i++) {
          // Just a quick test for bad chars.
          if (values[i] == "YES") {
            warnings["00280302"] = [
              {
                level: 1,
                text:
                  "Image contains recognizable visual features which cannot be anonymized.",
              },
            ];
          }
        }
      }

      // Check if the there are recognizable features
      if (key == "00120062") {
        var values = dcm[key]["Value"];
        for (var i = 0; i < values.length; i++) {
          // Just a quick test for bad chars.
          if (values[i] == "NO") {
            warnings["00120062"] = [
              { level: 1, text: "Image has not had personal data removed." },
            ];
          }
        }
      }
    }
  }

  return warnings;
}
