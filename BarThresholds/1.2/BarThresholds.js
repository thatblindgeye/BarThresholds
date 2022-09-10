/**
 * BarThresholds
 *
 * Version 1.2
 * Last updated: September 10, 2022
 * Author: thatblindgeye
 * GitHub: https://github.com/thatblindgeye
 */

const BarThresholds = (function () {
  "use strict";

  // --------------------------------------------------------------------------
  // Constant Variables
  // --------------------------------------------------------------------------

  const VERSION = "1.2";
  const LAST_UPDATED = 1662850283168;
  const THRESH_DISPLAY_NAME = `BarThresholds v${VERSION}`;
  const THRESH_CONFIG_NAME = "BarThresholds Config";

  const COMMANDS = {
    ADD_THRESHOLD: "add",
    EDIT_THRESHOLD: "edit",
    DELETE_THRESHOLD: "delete",
    GET_IMGSRC: "image",
    CONFIG: "config",
    EXTERNAL_ONLY: "external",
  };

  const THRESHOLD_KEYS = {
    FREQUENCY: "frequency",
    ONLY_TOKENS: "onlyTokens",
    EXCEPT_TOKENS: "exceptTokens",
    COMPARE_TYPE: "comparisonType",
    COMPARE_VALUES: "comparisonValues",
    EFFECT_TYPE: "effectType",
    EFFECT_VALUES: "effectValues",
  };

  const TARGET_TYPES = {
    ALL: "All tokens",
    EXCEPT_SELECTED: "Except selected tokens",
    ONLY_SELECTED: "Only selected tokens",
    GM_TOKENS: "GM tokens",
    PLAYER_TOKENS: "Player tokens",
  };

  const FREQUENCY_TYPES = {
    VAL_CHANGE: "Every bar value update",
    VAL_DECREASE: "When bar value decreases",
    VAL_INCREASE: "When bar value increases",
  };

  const COMPARISON_TYPES = {
    EQUAL: "Equal to",
    GREATER: "Greater than",
    GREATER_EQUAL: "Greater than or equal to",
    LESS: "Less than",
    LESS_EQUAL: "Less than or equal to",
    GREATER_LESS: "Greater than X and Less than Y",
    GREATER_LESS_EQUAL:
      "Greater than or equal to X and Less than or equal to Y",
  };

  const EFFECT_TYPES = {
    ADD_MARKER: "Add marker(s)",
    REMOVE_MARKER: "Remove marker(s)",
    ADD_REMOVE_MARKER: "Add marker(s) and Remove marker(s)",
    LAYER: "Move to layer",
    REMOVE_TOKEN: "Remove token",
    FX: "Spawn FX",
    AURA_1: "Update aura 1",
    AURA_2: "Update aura 2",
    BAR: "Update bar value",
    TOKEN_SIDE: "Update multi-sided/rollable token side",
    TINT: "Update tint color",
    IMGSRC: "Update token image",
    SCALE: "Update token scale",
    COMMAND: "Custom command",
  };

  const REGEX = {
    SCALE: /^(\*?\d+(\.?\d*|%?)|\d+\.?\d*\s*px)$/i,
    COLOR_VALUE: /^(\#([\da-f]{3}){1,2}|transparent)$/i,
    INT_OR_PERCENT: /^\-?(\d*%?|0\.\d+|1\.0)$/,
    AURA_RADIUS: /^[^\D]\d*\.?\d?$/,
    AURA_SHAPE: /^(square|circle)$/i,
    BOOLEAN: /^(true|false)$/i,
    LAYER: /^(gm|gmlayer|objects|tokens|map|background)$/i,
    IMAGE: /thumb\.(png|jpg|jpeg|gif)/i,
    NEW_SIDE: /^(\+|next|-|prev|previous|\?|random|\d+)$/i,
    BAR_NUMBER: /^bar(1|2|3)$/i,
    BAR_VALUE: /^(\+|-)?\d+$/,
  };

  const ROLL20_MARKERS = [
    {
      name: "red",
    },
    {
      name: "blue",
    },
    {
      name: "green",
    },
    {
      name: "brown",
    },
    {
      name: "purple",
    },
    {
      name: "pink",
    },
    {
      name: "yellow",
    },
    {
      name: "dead",
    },
  ];

  const FX_TYPES = [
    "bomb",
    "bubbling",
    "burn",
    "burst",
    "explode",
    "glow",
    "missile",
    "nova",
  ];

  const FX_COLORS = [
    "acid",
    "blood",
    "charm",
    "death",
    "fire",
    "frost",
    "holy",
    "magic",
    "slime",
    "smoke",
    "water",
  ];

  const CONFIG_TABS = {
    INSTRUCTIONS: "Instructions",
    THRESHOLDS: "Thresholds",
  };

  const DEFAULT_STATE = {
    bar1: [],
    bar2: [],
    bar3: [],
    configId: "",
    currentTab: "",
    version: VERSION,
    runExternalOnly: false,
  };

  // --------------------------------------------------------------------------
  // Styles
  // --------------------------------------------------------------------------

  const configNavActiveCSS = "background-color: #e4dfff;";
  const configNavCSS =
    "padding: 10px; border-radius: 25px; margin-right: 10px;";

  const thresholdCardHeaderCSS = "margin-right: 10px;";
  const thresholdCardSeparatorCSS =
    "margin-left: 10px; padding-left: 10px; border-left: 1px solid rgb(100, 100, 100);";
  const thresholdCardButtonCSS =
    "font-weight:bold; border-radius: 25px; border: 1px solid rgba(100, 100, 100, 0.5); padding: 4px 8px;";

  const listCSS = "margin: 0px; list-style: none;";
  const thresholdCardCSS =
    "margin-bottom: 10px; padding: 10px 5px; border: 1px solid rgb(100, 100, 100);";

  // --------------------------------------------------------------------------
  // Helper Functions
  // --------------------------------------------------------------------------

  function trimWhitespace(str) {
    return str.trim().replace(/&nbsp;|\s{2,}/g, (match) => {
      if (/&nbsp;/.test(match)) {
        return "";
      }

      if (/\s{2,}/.test(match)) {
        return " ";
      }
    });
  }

  function sendErrorMessage(message) {
    sendChat(
      THRESH_DISPLAY_NAME,
      `/w gm <div style="border: 1px solid rgba(255, 0, 0, 1); background-color: rgba(255, 0, 0, 0.25); padding: 8px;">${message}</div>`,
      null,
      { noarchive: true }
    );
  }

  function getCleanImgsrc(imgsrc) {
    const parts = imgsrc.match(
      /(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/
    );

    if (parts) {
      return (
        parts[1] +
        "thumb" +
        parts[3] +
        (parts[4] ? parts[4] : `?${Math.round(Math.random() * 9999999)}`)
      );
    }
  }

  function formatHexColor(color) {
    const colorAsArray = color.replace("#", "").split("");
    const longhandHex = _.map(
      colorAsArray,
      (character) => character + character
    ).join("");

    return `#${longhandHex}`;
  }

  function checkIsGmToken(token) {
    const character = getObj("character", token.get("represents"));
    const controlledBy = character.get("controlledby");
    const playerIds = controlledBy.split(",");

    if (
      (!_.contains(playerIds, "all") &&
        _.every(playerIds, (id) => playerIsGM(id))) ||
      (playerIds.length === 1 && playerIds[0] === "")
    ) {
      return true;
    }

    return false;
  }

  // --------------------------------------------------------------------------
  // Validation Functions
  // --------------------------------------------------------------------------

  function validateComparisonValues(type, values) {
    const { EQUAL, GREATER_LESS, GREATER_LESS_EQUAL } = COMPARISON_TYPES;

    if (type !== EQUAL) {
      if (values[0].trim() === "" && values.length === 1) {
        throw new Error(
          `When using a comparison type other than <code>${EQUAL}</code>, the comparison value(s) cannot be blank.`
        );
      }

      const invalidValues = _.filter(
        values,
        (value) => isNaN(parseFloat(value)) || !REGEX.INT_OR_PERCENT.test(value)
      ).join(", ");

      if (invalidValues) {
        throw new Error(
          `<div>The following values are not valid: <code>${invalidValues}</code></div><div>When using a comparison type other than <code>${EQUAL}</code>, any value(s) passed in must be a valid integer, e.g. <code>5</code> or <code>-5</code>, or a valid percentage, e.g. <code>25%</code>. A percentage may also be specified as a decimal between 0 and 1, e.g. <code>0.25</code> for 25% or <code>1.0</code> for 100%.</div>`
        );
      }
    }

    if (type === GREATER_LESS && values[0] === values[1]) {
      throw new Error(
        `When using the <code>${GREATER_LESS}</code> comparison types, the values passed in cannot be the same value. A threshold will not trigger because a bar value cannot be both greater than ${values[0]} and less than ${values[1]}.`
      );
    }

    if (type === GREATER_LESS || type === GREATER_LESS_EQUAL) {
      if (values.length !== 2) {
        throw new Error(
          `When using the <code>${GREATER_LESS}</code> or <code>${GREATER_LESS_EQUAL}</code> comparison types you must pass in two values, with the first value being the "greater than..." comparison value and the second value being the "less than..." comparison value.`
        );
      }

      if (parseFloat(values[0]) > parseFloat(values[1])) {
        throw new Error(
          `When using the <code>${GREATER_LESS}</code> or <code>${GREATER_LESS_EQUAL}</code> comparison types, the first value passed in (the "greater..." comparison value) must be smaller than the second value passed in (the "less..." comparison value). A threshold will not trigger because a bar value cannot be both greater than (or equal to) <code>${values[0]}</code> and less than (or equal to) <code>${values[1]}</code>.`
        );
      }
    }

    return values;
  }

  function validateColor(color) {
    if (!REGEX.COLOR_VALUE.test(color)) {
      throw new Error(
        `${color} is not a valid color value. Color value must either be <code>transparent</code>, or be in HEX format with exactly 3 or 6 characters following a hash <code>#</code>, e.g. <code>#f00</code> or <code>#ff0000</code>.`
      );
    }

    return color;
  }

  function validateEffectValues(type, values) {
    const {
      ADD_MARKER,
      REMOVE_MARKER,
      ADD_REMOVE_MARKER,
      SCALE,
      TINT,
      AURA_1,
      AURA_2,
      REMOVE_TOKEN,
      LAYER,
      IMGSRC,
      TOKEN_SIDE,
      BAR,
      FX,
    } = EFFECT_TYPES;

    if (
      (values[0] === "" || values[0][0] === "") &&
      values.length === 1 &&
      type !== REMOVE_TOKEN
    ) {
      throw new Error(
        `Effect value(s) cannot be blank for the <code>${type}</code> effect type.`
      );
    }

    if ([ADD_MARKER, REMOVE_MARKER, ADD_REMOVE_MARKER].includes(type)) {
      const campaignMarkers = [
        ...JSON.parse(Campaign().get("token_markers")),
        ...ROLL20_MARKERS,
      ];

      const invalidMarkers = _.filter(
        _.flatten(values),
        (tokenValue) => !_.findWhere(campaignMarkers, { name: tokenValue })
      ).join(", ");

      if (invalidMarkers) {
        throw new Error(
          `The following token markers do not exist in the campaign: <code>${invalidMarkers}</code>. When using the <code>${ADD_MARKER}</code>, <code>${REMOVE_MARKER}</code>, or <code>${ADD_REMOVE_MARKER}</code> effect types, you must pass in valid token markers.`
        );
      }

      if (type === ADD_REMOVE_MARKER) {
        if (values.length !== 2) {
          throw new Error(
            `When using the <code>${ADD_REMOVE_MARKER}</code> effect type, you must pass in a comma separate list of two values, with the first value being a space separated list of the token(s) to add and the second value being a space separated list of the token(s) to remove.<br/><br/>For example, <code>red yellow, blue green</code> would add the "red" and "yellow" markers, and remove the "blue" and "green" markers.`
          );
        }

        if (
          values.length === 2 &&
          ((values[0][0] === "" && values[0].length === 1) ||
            (values[1][0] === "" && values[1].length === 1))
        ) {
          throw new Error(
            `<code>${values[0].join(" ")}, ${values[1].join(
              " "
            )}</code> is not a valid effect value. When using the <code>${ADD_REMOVE_MARKER}</code> effect type, you must pass in a comma separated list of two values and cannot pass in any blank value.<br/><br/>If you only want to add or remove token markers, use the <code>${ADD_MARKER}</code> or <code>${REMOVE_MARKER}</code> effect type instead.`
          );
        }
      }

      return values;
    }

    if (type === SCALE) {
      const invalidScaleValues = _.filter(
        values,
        (scaleValue) => !REGEX.SCALE.test(scaleValue)
      );

      if (invalidScaleValues.length) {
        throw new Error(
          `The following values are not valid: <code>${invalidScaleValues.join(
            ", "
          )}</code><br/><br/>When using the <code>${SCALE}</code> effect type, the value(s) passed in must be either an integer/decimal, an asterisk <code>*</code> followed by an integer/decimal, or an integer/decimal followed by <code>px</code>.`
        );
      }

      return values;
    }

    if (type === TINT) {
      validateColor(values[0]);

      return values;
    }

    if (type === AURA_1 || type === AURA_2) {
      validateColor(values[2]);

      if (values[3] && !REGEX.BOOLEAN.test(values[3])) {
        throw new Error(
          `${values[3]} is not a valid boolean value. When passing in the optional parameter for showing an aura to players, you must pass in a valid boolean value of <code>true</code> or <code>false</code>.`
        );
      }

      if (values.length < 3 && parseInt(values[0]) !== 0) {
        throw new Error(
          `When using the <code>${AURA_1}</code> or <code>${AURA_2}</code> effect types, you must either pass in a comma separated list of values formatted as <code>radius, shape, color, optional boolean to show the aura to players</code>, or <code>0</code> to turn the aura off.`
        );
      }

      if (!REGEX.AURA_RADIUS.test(values[0])) {
        throw new Error(
          `${values[0]} is not a valid value for the aura radius. Aura radius must be a positive integer, e.g. <code>5</code>, or <code>0</code> to remove the aura.`
        );
      }

      if (!REGEX.AURA_SHAPE.test(values[1].trim())) {
        throw new Error(
          `${values[1]} is not a valid value for the aura shape. You must pass in either <code>square</code> or <code>false</code> or <code>circle</code> as an aura shape value.`
        );
      }

      return values;
    }

    if (type === LAYER) {
      if (!REGEX.LAYER.test(values[0])) {
        throw new Error(
          `<code>${values[0]}</code> is not a valid layer. When using the <code>${LAYER}</code> effect type, you must enter a value of either <code>gm</code>, <code>objects</code>, or <code>map</code>.`
        );
      }

      return values;
    }

    if (type === IMGSRC) {
      if (!REGEX.IMAGE.test(values[0])) {
        throw new Error(
          `<code>${values[0]}</code> is not a valid imgsrc. When using the <code>${IMGSRC}</code> effect type, the imgsrc must be the "thumb" version and in a PNG/JPG/JPEG/GIF format.<br/><br/>To get the "thumb" version of an imgsrc, select the graphic with the desired image on the tabletop and call the <code>${COMMANDS.GET_IMGSRC}</code> command.`
        );
      }

      return values;
    }

    if (type === TOKEN_SIDE) {
      if (!REGEX.NEW_SIDE.test(values[0])) {
        throw new Error(
          `<code>${values[0]}</code> is not a valid value. When using the <code>${TOKEN_SIDE}</code> effect type, you must pass in an integer, a plus sign <code>+</code>, or a minus sign <code>-</code>.`
        );
      }

      return values;
    }

    if (type === BAR) {
      if (values.length !== 2) {
        throw new Error(
          `When using the <code>${BAR}</code> effect type, you must pass in a comma separated list of two values. The first value must be the bar target, and the second value must be the new value of the bar.`
        );
      }

      if (!REGEX.BAR_NUMBER.test(values[0])) {
        throw new Error(
          `<code>${values[0]}</code> is not a valid bar. When using the <code>${BAR}</code> effect type, the first value must be the string <code>bar</code> immediately followed by the number 1, 2, or 3.`
        );
      }

      if (!REGEX.BAR_VALUE.test(values[1])) {
        throw new Error(
          `<code>${values[1]}</code> is not a value value. When using the <code>${BAR}</code> effect type, the new value for the bar target must be either a number or string, a plus sign <code>+</code> followed by a number, or a minus sign <code>-</code> followed by a number.`
        );
      }

      return values;
    }

    if (type === FX) {
      if (/\-/.test(values[0])) {
        const [fxType, fxColor] = values[0].split("-");

        if (!FX_TYPES.includes(fxType.toLowerCase())) {
          throw new Error(
            `<code>${fxType}</code> is not a valid FX type. When using the <code>${FX}</code> effect type, the FX passed in must be one of the following: <code>${FX_TYPES.join(
              ", "
            )}</code>.<br/><br/>Currently the <code>beam, breath, and splatter</code> FX types are not supported.`
          );
        }

        if (!FX_COLORS.includes(fxColor.toLowerCase())) {
          throw new Error(
            `<code>${fxColor}</code> is not a valid FX color. When using the <code>${FX}</code> effect type, the color passed in must be one of the following: <code>${FX_COLORS.join(
              ", "
            )}</code>.`
          );
        }

        return values;
      } else {
        const customFx = findObjs({ _type: "custfx", name: values[0] })[0];

        if (!customFx) {
          throw new Error(
            `<code>${values[0]}</code> is not a valid custom FX. Make sure the custom FX exists in the campaign and that the spelling and lettercase is correct.`
          );
        }

        return [customFx.id];
      }
    }
  }

  // --------------------------------------------------------------------------
  // Command Functions
  // --------------------------------------------------------------------------

  function setThresholdTargets(targets, selectedTokens) {
    const { ONLY_TOKENS, EXCEPT_TOKENS } = THRESHOLD_KEYS;
    const { ALL, ONLY_SELECTED, GM_TOKENS, PLAYER_TOKENS } = TARGET_TYPES;

    if (selectedTokens && ![ALL, GM_TOKENS, PLAYER_TOKENS].includes(targets)) {
      const tokenNames = _.map(selectedTokens, (selected) => {
        const token = getObj("graphic", selected._id);
        return token.get("name");
      });

      if (targets === ONLY_SELECTED) {
        return { [ONLY_TOKENS]: tokenNames, [EXCEPT_TOKENS]: [] };
      }

      return { [ONLY_TOKENS]: [], [EXCEPT_TOKENS]: tokenNames };
    }

    if ([GM_TOKENS, PLAYER_TOKENS].includes(targets)) {
      const targetsText = targets === GM_TOKENS ? GM_TOKENS : PLAYER_TOKENS;

      return { [ONLY_TOKENS]: [targetsText], [EXCEPT_TOKENS]: [] };
    }

    return { [ONLY_TOKENS]: [], [EXCEPT_TOKENS]: [] };
  }

  function formatEffectValues(effectType, effectValues) {
    const { EFFECT_VALUES } = THRESHOLD_KEYS;
    const { COMMAND, ADD_MARKER, REMOVE_MARKER, ADD_REMOVE_MARKER, FX } =
      EFFECT_TYPES;

    if (effectType === COMMAND) {
      return {
        [EFFECT_VALUES]: [
          effectValues.replace(/&#124;|&#44;/g, (match) => {
            if (/&#124;/.test(match)) {
              return "|";
            }

            if (/&#44;/.test(match)) {
              return ",";
            }
          }),
        ],
      };
    }

    const splitEffectValues = effectValues
      .split(/\s*,\s*/)
      .map((effectValue) => trimWhitespace(effectValue));

    if ([ADD_MARKER, REMOVE_MARKER, ADD_REMOVE_MARKER].includes(effectType)) {
      const formattedEffectValues = _.map(splitEffectValues, (effectValue) =>
        effectValue.split(/\s+/)
      );

      return {
        [EFFECT_VALUES]: validateEffectValues(
          effectType,
          formattedEffectValues
        ),
      };
    }

    return {
      [EFFECT_VALUES]: validateEffectValues(effectType, splitEffectValues),
    };
  }

  function createThreshold(selectedTokens, commandArgs) {
    const { FREQUENCY, COMPARE_TYPE, COMPARE_VALUES, EFFECT_TYPE } =
      THRESHOLD_KEYS;
    const [
      ,
      frequency,
      targetTokens,
      comparisonType,
      comparisonValues,
      effectType,
      effectValues,
    ] = commandArgs;

    const compareValueArray = comparisonValues
      .split(/\s*,\s*/)
      .map((value) => trimWhitespace(value));

    return {
      [FREQUENCY]: frequency,
      ...setThresholdTargets(targetTokens, selectedTokens),
      [COMPARE_TYPE]: comparisonType,
      [COMPARE_VALUES]: validateComparisonValues(
        comparisonType,
        compareValueArray
      ),
      [EFFECT_TYPE]: effectType,
      ...formatEffectValues(effectType, effectValues),
    };
  }

  function getEditedThresholdValues(
    propertyToEdit,
    selectedTokens,
    commandArgs
  ) {
    const { FREQUENCY, COMPARE_TYPE, COMPARE_VALUES, EFFECT_TYPE } =
      THRESHOLD_KEYS;

    switch (propertyToEdit) {
      case "frequency":
        return {
          [FREQUENCY]: commandArgs[1],
        };
      case "targets":
        return {
          ...setThresholdTargets(commandArgs[1], selectedTokens),
        };
      case "comparison":
        const newCompareValues = commandArgs[2]
          .split(/\s*,\s*/)
          .map((value) => trimWhitespace(value));

        return {
          [COMPARE_TYPE]: commandArgs[1],
          [COMPARE_VALUES]: validateComparisonValues(
            commandArgs[1],
            newCompareValues
          ),
        };
      case "effect":
        return {
          [EFFECT_TYPE]: commandArgs[1],
          ...formatEffectValues(commandArgs[1], commandArgs[2]),
        };
    }
  }

  function getValueForCompare(bar, token, compareValue) {
    const barMax = parseFloat(token.get(`${bar}_max`));

    if (
      (/%$/.test(compareValue) && !isNaN(parseInt(compareValue))) ||
      (/(0\.\d+|1\.0)/.test(compareValue) && !isNaN(parseFloat(compareValue)))
    ) {
      if (isNaN(barMax)) {
        sendErrorMessage(
          `${token.get(
            "name"
          )} does not have a valid maximum set for <code>${bar}</code>. Tokens must have a maximum set for a bar when using a percentage comparison value, and the maximum must be an integer or decimal.`
        );
        return;
      }

      const percentAsDecimal = /%$/.test(compareValue)
        ? parseInt(compareValue) / 100
        : parseFloat(compareValue);
      return Math.floor(barMax * percentAsDecimal);
    }

    return compareValue;
  }

  function runComparison(bar, prevBarValue, token, compareType, compareValues) {
    const {
      EQUAL,
      GREATER,
      LESS,
      GREATER_EQUAL,
      LESS_EQUAL,
      GREATER_LESS,
      GREATER_LESS_EQUAL,
    } = COMPARISON_TYPES;

    const barValue =
      compareType === EQUAL
        ? token.get(`${bar}_value`)
        : parseFloat(token.get(`${bar}_value`));
    const firstCompareValue =
      compareType === EQUAL
        ? getValueForCompare(bar, token, compareValues[0])
        : parseFloat(getValueForCompare(bar, token, compareValues[0]));
    const secondCompareValue = compareValues[1]
      ? parseFloat(getValueForCompare(bar, token, compareValues[1]))
      : undefined;

    switch (compareType) {
      case EQUAL:
        return barValue == firstCompareValue;
      case GREATER:
        return (
          barValue > firstCompareValue && !(prevBarValue > firstCompareValue)
        );
      case LESS:
        return (
          barValue < firstCompareValue && !(prevBarValue < firstCompareValue)
        );
      case GREATER_EQUAL:
        return (
          barValue >= firstCompareValue && !(prevBarValue >= firstCompareValue)
        );
      case LESS_EQUAL:
        return (
          barValue <= firstCompareValue && !(prevBarValue <= firstCompareValue)
        );
      case GREATER_LESS:
        return (
          barValue > firstCompareValue &&
          barValue < secondCompareValue &&
          !(
            prevBarValue > firstCompareValue &&
            prevBarValue < secondCompareValue
          )
        );
      case GREATER_LESS_EQUAL:
        return (
          barValue >= firstCompareValue &&
          barValue <= secondCompareValue &&
          !(
            prevBarValue >= firstCompareValue &&
            prevBarValue <= secondCompareValue
          )
        );
      default:
        return false;
    }
  }

  function setMarkers(token, effectType, markerValues) {
    const currentTokenMarkers = token.get("statusmarkers");
    let newTokenMarkers = currentTokenMarkers;

    if (/add/i.test(effectType)) {
      _.each(markerValues[0], (markerToAdd) => {
        newTokenMarkers += `,${markerToAdd}`;
      });
    }

    if (/remove/i.test(effectType)) {
      const markerValIndex = /add/i.test(effectType) ? 1 : 0;

      _.each(markerValues[markerValIndex], (markerToRemove) => {
        newTokenMarkers = newTokenMarkers
          .split(/\s*,\s*/)
          .filter((marker) => marker !== markerToRemove)
          .join(",");
      });
    }

    if (newTokenMarkers !== currentTokenMarkers) {
      token.set("statusmarkers", newTokenMarkers);
    }
  }

  function setScale(token, scaleValues) {
    const widthScale = scaleValues[0];
    const heightScale = scaleValues[1] || widthScale;
    const currentWidth = token.get("width");
    const currentHeight = token.get("height");
    const currentPage = getObj("page", token.get("pageid"));

    const calculateNewSize = (scale, currentSize) => {
      if (/^\*\d+$/.test(scale)) {
        return currentSize * parseFloat(scale.replace(/\*/, ""));
      } else if (/^\d+$/.test(scale)) {
        return (
          parseFloat(scale) *
          (parseFloat(currentPage.get("snapping_increment")) * 70)
        );
      } else if (/^\d+px$/.test(scale)) {
        return parseFloat(scale);
      }

      return currentSize;
    };

    const newWidth = calculateNewSize(widthScale, currentWidth);
    const newHeight = calculateNewSize(heightScale, currentHeight);
    const dimensionsToSet = {};

    if (newWidth !== currentWidth) {
      dimensionsToSet.width = newWidth;
    }

    if (newHeight !== currentHeight) {
      dimensionsToSet.height = newHeight;
    }

    if (!_.isEmpty(dimensionsToSet)) {
      token.set(dimensionsToSet);
    }
  }

  function setAura(token, aura, auraValues) {
    const currentAuraRadius = token.get(`${aura}_radius`);
    const currentIsSquareAura = token.get(`${aura}_square`);
    const currentColor = token.get(`${aura}_color`);
    const currentShowPlayers = token.get(`showplayers_${aura}`);
    const newAuraRadius = auraValues[0] != "0" ? parseFloat(auraValues[0]) : "";
    const newIsSquareAura = /^(square)$/i.test(auraValues[1]);
    const newColor =
      auraValues[2].length === 7
        ? auraValues[2]
        : formatHexColor(auraValues[2]);
    const newShowPlayers = /^true$/i.test(auraValues[3]);
    const auraToSet = {};

    if (newAuraRadius !== currentAuraRadius) {
      auraToSet[`${aura}_radius`] = newAuraRadius;
    }
    if (newIsSquareAura !== currentIsSquareAura) {
      auraToSet[`${aura}_square`] = newIsSquareAura;
    }
    if (newColor !== currentColor) {
      auraToSet[`${aura}_color`] = newColor;
    }
    if (newShowPlayers !== currentShowPlayers) {
      auraToSet[`showplayers_${aura}`] = newShowPlayers;
    }

    if (!_.isEmpty(auraToSet)) {
      token.set(auraToSet);
    }
  }

  function setLayer(token, layer) {
    const currentLayer = token.get("layer");
    let newLayer = "";

    if (/gm/i.test(layer)) {
      newLayer = "gmlayer";
    } else if (/objects|tokens/i.test(layer)) {
      newLayer = "objects";
    } else if (/map|background/i.test(layer)) {
      newLayer = "map";
    }

    if (newLayer && newLayer !== currentLayer) {
      token.set("layer", newLayer);
    }
  }

  function setCurrentTokenSide(token, side) {
    const tokenSides = token.get("sides").split("|").map(decodeURIComponent);
    const currentSide = token.get("currentSide");
    let sideToGet = 0;

    switch (side) {
      case "?":
      case "random":
        sideToGet = _.random(0, tokenSides.length - 1);
        break;
      case "+":
      case "next":
        sideToGet =
          currentSide + 1 > tokenSides.length - 1 ? 0 : currentSide + 1;
        break;
      case "-":
      case "prev":
      case "previous":
        sideToGet =
          currentSide - 1 < 0 ? tokenSides.length - 1 : currentSide - 1;
        break;
      default:
        sideToGet = parseInt(side) - 1 < 0 ? 0 : parseInt(side) - 1;
        break;
    }

    if (!tokenSides[sideToGet]) {
      sendErrorMessage(
        `Could not update multi-sided/rollable token side for ${token.get(
          "name"
        )}. Side at index <code>${sideToGet}</code> does not exist.`
      );
      return;
    }

    if (sideToGet !== currentSide) {
      token.set({
        imgsrc: getCleanImgsrc(tokenSides[sideToGet]),
        currentSide: sideToGet,
      });
    }
  }

  function setBarValue(token, barEffectValues) {
    let [barTarget, newBarValue] = barEffectValues;
    const currentBarValue = token.get(`${barTarget}_value`);

    if (/^\+|-/.test(newBarValue)) {
      newBarValue = parseFloat(newBarValue) + parseFloat(currentBarValue || 0);
    }

    if (newBarValue !== currentBarValue) {
      token.set(`${barTarget}_value`, newBarValue);
    }
  }

  function runEffect(token, effectType, effectValues) {
    const {
      ADD_MARKER,
      REMOVE_MARKER,
      ADD_REMOVE_MARKER,
      SCALE,
      TINT,
      AURA_1,
      AURA_2,
      REMOVE_TOKEN,
      LAYER,
      IMGSRC,
      TOKEN_SIDE,
      BAR,
      FX,
      COMMAND,
    } = EFFECT_TYPES;

    switch (effectType) {
      case ADD_MARKER:
        setMarkers(token, ADD_MARKER, effectValues);
        break;
      case REMOVE_MARKER:
        setMarkers(token, REMOVE_MARKER, effectValues);
        break;
      case ADD_REMOVE_MARKER:
        setMarkers(token, ADD_REMOVE_MARKER, effectValues);
        break;
      case SCALE:
        setScale(token, effectValues);
        break;
      case TINT:
        const currentTint = token.get("tint_color");
        const newTint =
          effectValues[0].length === 7
            ? effectValues[0]
            : formatHexColor(effectValues[0]);

        if (newTint !== currentTint) {
          token.set("tint_color", newTint);
        }
        break;
      case AURA_1:
        setAura(token, "aura1", effectValues);
        break;
      case AURA_2:
        setAura(token, "aura2", effectValues);
        break;
      case REMOVE_TOKEN:
        token.remove();
        break;
      case LAYER:
        setLayer(token, effectValues[0]);
        break;
      case IMGSRC:
        const currentImg = token.get("imgsrc");

        if (effectValues[0] !== currentImg) {
          token.set("imgsrc", effectValues[0]);
        }
        break;
      case TOKEN_SIDE:
        setCurrentTokenSide(token, effectValues[0]);
        break;
      case BAR:
        setBarValue(token, effectValues);
        break;
      case FX:
        spawnFx(token.get("left"), token.get("top"), effectValues[0]);
        break;
      case COMMAND:
        sendChat("", effectValues[0], null, { noarchive: true });
        break;
      default:
        break;
    }
  }

  function runThresholds(bar, tokenObj, prevBarValue) {
    const { GM_TOKENS, PLAYER_TOKENS } = TARGET_TYPES;
    const { VAL_INCREASE, VAL_DECREASE } = FREQUENCY_TYPES;
    const {
      FREQUENCY,
      ONLY_TOKENS,
      EXCEPT_TOKENS,
      COMPARE_TYPE,
      COMPARE_VALUES,
      EFFECT_TYPE,
      EFFECT_VALUES,
    } = THRESHOLD_KEYS;

    if (!state.BarThresholds[bar].length) {
      return;
    }

    _.each(state.BarThresholds[bar], (threshold) => {
      const tokenId = tokenObj._id || tokenObj.id;
      const token = getObj("graphic", tokenId);
      const tokenName = token.get("name");
      const tokenBarValue = token.get(`${bar}_value`);
      const isGmToken = checkIsGmToken(token);
      const parsedPrevBarValue = parseFloat(prevBarValue);

      if (
        (threshold[FREQUENCY] === VAL_INCREASE &&
          !(parseFloat(tokenBarValue) > parsedPrevBarValue)) ||
        (threshold[FREQUENCY] === VAL_DECREASE &&
          !(parseFloat(tokenBarValue) < parsedPrevBarValue))
      ) {
        return;
      }

      if (
        (!isGmToken && threshold[ONLY_TOKENS][0] === GM_TOKENS) ||
        (isGmToken && threshold[ONLY_TOKENS][0] === PLAYER_TOKENS) ||
        _.contains(threshold[EXCEPT_TOKENS], tokenName) ||
        (threshold[ONLY_TOKENS].length &&
          ![GM_TOKENS, PLAYER_TOKENS].includes(threshold[ONLY_TOKENS][0]) &&
          !_.contains(threshold[ONLY_TOKENS], tokenName))
      ) {
        return;
      }

      if (
        !runComparison(
          bar,
          parsedPrevBarValue,
          token,
          threshold[COMPARE_TYPE],
          threshold[COMPARE_VALUES]
        )
      ) {
        return;
      }

      runEffect(token, threshold[EFFECT_TYPE], threshold[EFFECT_VALUES]);
    });
  }

  function setExternalOnly(commandArgs) {
    const { EXTERNAL_ONLY } = COMMANDS;

    if (commandArgs.length && !REGEX.BOOLEAN.test(commandArgs[0])) {
      throw new Error(
        `${commandArgs[0]} is not a valid value. When using the ${EXTERNAL_ONLY} command, you must pass in a boolean of either <code>true</code> or <code>false</code>.`
      );
    }

    const createMessageText = (value) =>
      value
        ? "within external scripts only."
        : "within external scripts and when bar value change events occur within the BarThresholds script.";

    if (!commandArgs.length) {
      const { runExternalOnly } = state.BarThresholds;
      sendChat(
        THRESH_DISPLAY_NAME,
        `/w gm Thresholds are currently set to run ${createMessageText(
          runExternalOnly
        )}`,
        null,
        { noarchive: true }
      );
    } else {
      const externalValue = commandArgs[0] === "true";
      state.BarThresholds.runExternalOnly = externalValue;
      sendChat(
        THRESH_DISPLAY_NAME,
        `/w gm Thresholds will now run ${createMessageText(externalValue)}`,
        null,
        { noarchive: true }
      );
    }
  }

  // --------------------------------------------------------------------------
  // Config Functions
  // --------------------------------------------------------------------------

  function createQueryStrings(command, bar) {
    const frequencyQuery =
      "?{Threshold frequency|" + _.values(FREQUENCY_TYPES).join("|") + "}";

    const targetsQuery =
      "?{Threshold targets|" + _.values(TARGET_TYPES).join("|") + "}";

    const comparisonTypeQuery =
      "?{Comparison type|" + _.values(COMPARISON_TYPES).join("|") + "}";

    const effectTypeQuery =
      "?{Effect type|" + _.values(EFFECT_TYPES).join("|") + "}";

    return {
      frequencyQuery,
      targetsQuery,
      comparisonTypeQuery,
      effectTypeQuery,
    };
  }

  function buildConfigNav() {
    const { currentTab } = state.BarThresholds;
    const { INSTRUCTIONS, THRESHOLDS } = CONFIG_TABS;

    const instructionsTabCSS = `${configNavCSS} ${
      currentTab === INSTRUCTIONS ? configNavActiveCSS : ""
    }`;

    const thresholdsTabCSS = `${configNavCSS} ${
      currentTab === THRESHOLDS ? configNavActiveCSS : ""
    }`;

    return `<div style='margin-bottom: 20px;'><a href='!thresh config|${INSTRUCTIONS}' style='${instructionsTabCSS}'>Instructions</a><a href='!thresh config|${THRESHOLDS}' style='${thresholdsTabCSS}$'>Thresholds</a></div>`;
  }

  function buildInstructionsContent() {
    state.BarThresholds.currentTab = CONFIG_TABS.INSTRUCTIONS;
    return `
      <h1>${THRESH_CONFIG_NAME}</h1>
        <h2>Adding a Threshold</h2>
        <p>Each token bar has its own section in the "Thresholds" tab of the BarThresholds Config character bio. Clicking the "Add threshold" button within a section will trigger a series of dialogs for you to enter threshold data.</p>
          <h3>Threshold Targets</h3>
            <p>This dialog determines which tokens a threshold will affect. The possible options are:</p>
            <ul>
              <li><span style="font-weight: bold;">All tokens</span>: The threshold will affect every token.</li>
              <li><span style="font-weight: bold;">Only selected tokens</span>: The threshold will affect only the tokens that are selected when the threshold is created.</li>
              <li><span style="font-weight: bold;">Except selected tokens</span>: The opposite of the previous option. The threshold will affect all tokens except ones that are selected when the threshold is created.</li>
            </ul>
            <p>When choosing the "Only selected tokens" or "Except selected tokens" option, you should ensure you select any tokens before clicking "submit" on the final "Effect value(s)" step.</p>
          <h3>Comparison Type</h3>
            <p>This dialog determines what comparison is made against the applicable bar value when a threshold runs. If a comparison returns <code>false</code> for a threshold target the threshold will stop executing, and if the comparison returns <code>true</code> it will continue executing to run the linked effect. The possible options are:</p>
            <ul>
              <li><span style='font-weight: bold;'>Equal to</span>: The comparison will return <code>true</code> only when the bar value is equal to the comparison value. This comparison type can be used for both numbers or strings, and the comparison does not check for strict equality. For example, if the comparison value is <code>5</code>, the comparison will return <code>true</code> when the bar value is also <code>5</code>, regardless if the value type is a number or string. Note that this is the only comparison type that can have non-integers or non-percentages entered as a comparison value.</li>
              <li><span style='font-weight: bold;'>Greater than</span>: The comparison will return <code>true</code> only when the bar value is greater than the comparison value.</li>
              <li><span style='font-weight: bold;'>Less than</span>: The comparison will return <code>true</code> only when the bar value is less than the comparison value.</li>
              <li><span style='font-weight: bold;'>Greater than or equal to</span>: The comparison will return <code>true</code> when the bar value is either greater than or equal to the comparison value.</li>
              <li><span style='font-weight: bold;'>Less than or equal to</span>: The comparison will return <code>true</code> when the bar value is either less than or equal to the comparison value.</li>
              <li><span style='font-weight: bold;'>Greater than X and Less than Y</span>: The comparison will return <code>true</code> only when the bar value is both greater than one comparison value and less than another comparison value.</li>
              <li><span style='font-weight: bold;'>Greater than or equal to X and Less than or equal to Y</span>: The comparison will return <code>true</code> only when the bar value is both greater than or equal to one comparison value, and less than or equal to another comparison value.</li>
            </ul>
            <p>When the "Greater than X and Less than Y" comparison type is selected, you must also make sure the two values entered are not the same (a bar value cannot be both greater than 50 and less than 50).</p>
            <p>When the "Greater than X and Less than Y" or "Greater than or equal to X and Less than or equal to Y" comparison types are selected, you must enter two values as a comma separated list, e.g. <code>10, 20</code>. Additionally, the first value entered must be smaller than the second value entered, otherwise the threshold will not be created (a bar value cannot be both greater than (or equal to) 50 and less than (or equal to) 25).</p>
          <h3>Comparison Value(s)</h3>
            <p>This dialog determines the value to compare a bar value against in the comparison that is ran. You can enter either a string e.g. <code>five</code> (only when using a comparison type of <code>Equal to</code>), an integer e.g. <code>5</code>, or a percentage e.g. <code>25%</code>. If left blank, the threshold will not be created.</p>
            <p>When a percentage is entered, the comparison value will be the specified percentage of the bar max, rounded down. For example, if a value of <code>25%</code> is entered and a threshold target has a bar max of <code>50</code>, the comparison value will be <code>12</code> (50 x 25% = 12.5, rounded down to 12).</p>
            <p>if a threshold target does not have a bar max set when a percentage is entered as the comparison value, the comparison will return <code>false</code> and the threshold's effect will not be called.</p>
          <h3>Effect Type</h3>
            <p>This dialog determines what effect will be ran when a comparison returns <code>true</code>. The possible options are:</p>
            <ul>
              <li><span style='font-weight: bold;'>Add marker</span>: This will add a single marker to the threshold target. This effect will only add a single marker, even if the same threshold executes multiple times on the same target. For all marker effect types, you must enter a marker name that exists in your campaign, otherwise the threshold will not be created.</li>
              <li><span style='font-weight: bold;'>Remove marker</span>: This will remove a single marker from the threshold target. If the target has multiple of the specified marker, all instances of that marker will be removed.</li>
              <li><span style='font-weight: bold;'>Add marker and Remove marker</span>This will add one marker to the threshold target, and remove another marker from them. When entering a value for this effect type, you must enter a comma separated list of values, e.g. <code>red, yellow</code> would add the "red" marker and remove the "yellow" marker.</li>
              <li><span style='font-weight: bold;'>Update tint color</span>: This will update the tint color for the threshold target. When entering a value for this effect type, you must enter a HEX color with 6 digits, e.g. <code>#ff0000</code>. Shorthand HEX values are not allowed.</li>
              <li><span style='font-weight: bold;'>Update aura 1</span> and <span style='font-weight: bold;'>Update aura 2</span>: This will update one of the two aura's on the threshold target. When entering a value for this effect type, you must enter either <code>0</code> to turn the aura off or a comma separated list formatted as <code>aura radius, aura shape, aura color, optional boolean to show the aura to players</code>.<br/><br/>The aura radius must be a positive number, either an integer or decimal. The aura shape must either be a value of <code>circle</code> or <code>square</code>. The aura color must be a HEX color with 6 digits (shorthand HEX values are not allowed). By default, an aura radius is set to not be shown to players, so this value can be omitted if you do not want the aura to be shown to players when set via the threshold.</li>
              <li><span style='font-weight: bold;'>Custom command</span>: This effect type allows you to enter a custom command from another script you have installed in the campaign. Due to how the BarThresholds script handles splitting apart its own commands to parse the various parameters, when entering a custom command you must use the HTML entities for vertical pipes <code>|</code> and commas <code>,</code>. The HTML entitiy for vertical pipes is <code>&#124;</code>, and the HTML entity for commas is <code>&#44;</code>.<br/><br/>For example, to enter a custom command such as <code>!prefix keyword|option1, option2</code>, you would have to enter <code>!prefix keyword&#124;option1&#44; option2</code>. BarThresholds will then replace the entities to the correct characters so that the commands will run correctly when the threshold is triggered.</li>
            </ul>
          <h3>Effect Value(s)</h3>
            <p>This dialog determines the actual value(s) of the chosen effect type. If left blank, the threshold will not be created.</p>
        <h2>Editing and Deleting Thresholds</h2>
          <p>Each individual threshold can be edited or deleted after creation. For each threshold, you can click the "Threshold Targets", "Comparison", or "Effect" buttons to edit the related properties of that threshold.</p>
          <p>After clicking the "Delete threshold" button, a dialog asking you to confirm the deletion will appear, with the default selection being "Cancel" as a precaution to avoid accidental deletion.</p>
        <h2>Running Thresholds in External Scripts</h2>
          <p><code>BarThresholds.RunThresholds(bar, tokenID)</code></p>
          <p>The <code>runThresholds</code> method is exported from the BarThresholds script, allowing you to run thresholds in your own custom commands outside of the <code>change:graphic:barX_value</code> event. This can be especially useful if a token's bar value is set via Roll20's <code>set</code> method, as this will not trigger the <code>change:graphic:barX_value</code> events within the BarThresholds script.</p>
          <p>When using the <code>runThresholds</code> method, you must pass in two parameters: a <code>bar</code> and a <code>tokenID</code>. The<code>bar</code> parameter determines which bar thresholds to run and must be a value of either "bar1", "bar2", or "bar3". The <code>tokenID</code> parameter determines whether the token with that ID is a valid threshold target. This can either be manually passed in as a string, e.g. <code>"-N8u_AM_kks6if4OUmhT"</code>, or it can be passed in by accessing the <code>id</code> property on an object, e.g. <code>obj.id</code>.</p>`;
  }

  function createTargetsCardText(threshold) {
    const { ALL, ONLY_SELECTED, EXCEPT_SELECTED, GM_TOKENS, PLAYER_TOKENS } =
      TARGET_TYPES;
    const { ONLY_TOKENS, EXCEPT_TOKENS } = THRESHOLD_KEYS;
    let targetsText;
    let targetsList = [];

    if (
      _.isEmpty(threshold[ONLY_TOKENS]) &&
      _.isEmpty(threshold[EXCEPT_TOKENS])
    ) {
      targetsText = ALL;
    } else {
      if (threshold[ONLY_TOKENS][0] === GM_TOKENS) {
        targetsText = GM_TOKENS;
      } else if (threshold[ONLY_TOKENS][0] === PLAYER_TOKENS) {
        targetsText = PLAYER_TOKENS;
      } else {
        const targetsArray = !_.isEmpty(threshold[ONLY_TOKENS])
          ? threshold[ONLY_TOKENS]
          : threshold[EXCEPT_TOKENS];
        targetsList = _.map(targetsArray, (target) => target);
        targetsText =
          (!_.isEmpty(threshold[ONLY_TOKENS])
            ? ONLY_SELECTED
            : EXCEPT_SELECTED) + ": ";
      }
    }

    return `${targetsText}${targetsList ? ": " + targetsList.join(", ") : ""}`;
  }

  function createComparisonCardText(threshold, compareType) {
    const { COMPARE_VALUES } = THRESHOLD_KEYS;
    const {
      EQUAL,
      GREATER,
      LESS,
      GREATER_EQUAL,
      LESS_EQUAL,
      GREATER_LESS,
      GREATER_LESS_EQUAL,
    } = COMPARISON_TYPES;

    switch (compareType) {
      case EQUAL:
      case GREATER:
      case GREATER_EQUAL:
      case LESS:
      case LESS_EQUAL:
        return `${compareType} ${threshold[COMPARE_VALUES][0]}`;
      case GREATER_LESS:
      case GREATER_LESS_EQUAL:
        const textWithValues = compareType.replace(/[xy]/gi, (match) => {
          if (/x/i.test(match)) {
            return threshold[COMPARE_VALUES][0];
          }

          return threshold[COMPARE_VALUES][1];
        });

        return textWithValues;
    }
  }

  function createEffectValueCardText(threshold, effectType) {
    const { EFFECT_VALUES } = THRESHOLD_KEYS;
    const {
      ADD_MARKER,
      REMOVE_MARKER,
      ADD_REMOVE_MARKER,
      AURA_1,
      AURA_2,
      REMOVE_TOKEN,
      BAR,
    } = EFFECT_TYPES;

    switch (effectType) {
      case ADD_MARKER:
      case REMOVE_MARKER:
        return `${effectType}: ${threshold[EFFECT_VALUES][0].join(", ")}`;
      case ADD_REMOVE_MARKER:
        return `Add marker(s): ${threshold[EFFECT_VALUES][0].join(
          " "
        )}<span style="${thresholdCardSeparatorCSS}">Remove marker(s): ${threshold[
          EFFECT_VALUES
        ][1].join(" ")}</span>`;
      case AURA_1:
      case AURA_2:
        const auraNumber = effectType.includes("1") ? 1 : 2;
        return `Aura ${auraNumber} Radius: ${
          threshold[EFFECT_VALUES][0]
        }<span style="${thresholdCardSeparatorCSS}">Aura ${auraNumber} Shape: ${
          threshold[EFFECT_VALUES][1]
        }</span><span style="${thresholdCardSeparatorCSS}">Aura ${auraNumber} Color: ${
          threshold[EFFECT_VALUES][2]
        }</span><span style="${thresholdCardSeparatorCSS}">Aura ${auraNumber} ${
          threshold[EFFECT_VALUES][3]
            ? "visible to players"
            : "not visible to players"
        }</span>`;
      case REMOVE_TOKEN:
        return REMOVE_TOKEN;
      case BAR:
        return `Update ${threshold[EFFECT_VALUES][0]} value: ${threshold[EFFECT_VALUES][1]}`;
      default:
        return `${effectType}: ${threshold[EFFECT_VALUES].join(", ")}`;
    }
  }

  function buildThresholdCard(bar, threshold, index) {
    const {
      frequencyQuery,
      targetsQuery,
      comparisonTypeQuery,
      effectTypeQuery,
    } = createQueryStrings();
    const { FREQUENCY, COMPARE_TYPE, COMPARE_VALUES, EFFECT_TYPE } =
      THRESHOLD_KEYS;

    const targetsText = createTargetsCardText(threshold);
    const comparisonText = createComparisonCardText(
      threshold,
      threshold[COMPARE_TYPE]
    );
    const effectValueText = createEffectValueCardText(
      threshold,
      threshold[EFFECT_TYPE]
    );

    return (
      `<li style="${thresholdCardCSS}"><div><a href="!thresh ${COMMANDS.EDIT_THRESHOLD}-${index}-frequency|${bar}|${frequencyQuery}" style="${thresholdCardHeaderCSS}; ${thresholdCardButtonCSS}">Threshold Frequency</a><span>${threshold[FREQUENCY]}</span></div>` +
      `<div style="margin-top: 10px"><a href="!thresh ${COMMANDS.EDIT_THRESHOLD}-${index}-targets|${bar}|${targetsQuery}" style="${thresholdCardHeaderCSS}; ${thresholdCardButtonCSS}">Threshold Targets</a><span>${targetsText}</span></div>` +
      `<div style="margin-top: 10px"><a href="!thresh ${COMMANDS.EDIT_THRESHOLD}-${index}-comparison|${bar}|${comparisonTypeQuery}|?{Comparison value(s)}" style="${thresholdCardHeaderCSS}; ${thresholdCardButtonCSS}">Comparison</a><span>${comparisonText}</span></div>` +
      `<div style="margin-top: 10px"><a href="!thresh ${COMMANDS.EDIT_THRESHOLD}-${index}-effect|${bar}|${effectTypeQuery}|?{Effect value(s)}" style="${thresholdCardHeaderCSS}; ${thresholdCardButtonCSS}">Effect</a><span>${effectValueText}</span></div>` +
      `<div style="margin-top: 25px;"><a href="!thresh ${COMMANDS.DELETE_THRESHOLD}-${index}|${bar}|?{Confirm deletion|Cancel|Confirm}" style="color: red; ${thresholdCardButtonCSS}">Delete threshold</a></div></li>`
    );
  }

  function buildThresholdList() {
    const {
      frequencyQuery,
      targetsQuery,
      comparisonTypeQuery,
      effectTypeQuery,
    } = createQueryStrings();
    const { bar1, bar2, bar3 } = state.BarThresholds;
    let fullThresholdList = "";

    _.each([bar1, bar2, bar3], (bar, barIndex) => {
      let barThresholdList = "";
      const barName = `bar${barIndex + 1}`;
      _.each(bar, (thresholdItem, thresholdIndex) => {
        barThresholdList += buildThresholdCard(
          barName,
          thresholdItem,
          thresholdIndex
        );
      });

      fullThresholdList += `<div style="margin-bottom: 10px"><h2>Bar ${
        barIndex + 1
      } Thresholds</h2><a style="margin-top: 10px; ${thresholdCardButtonCSS}" href="!thresh ${
        COMMANDS.ADD_THRESHOLD
      }|${barName}|${frequencyQuery}|${targetsQuery}|${comparisonTypeQuery}|?{Comparison value(s)}|${effectTypeQuery}|?{Effect value(s)}">Add ${barName} threshold</a></div><ul style="${listCSS}">${barThresholdList}</ul>`;
    });

    return `<h1>${THRESH_CONFIG_NAME}</h1>${fullThresholdList}`;
  }

  function buildConfigTab(tabName) {
    state.BarThresholds.currentTab = tabName;
    const buildCallback =
      tabName === CONFIG_TABS.INSTRUCTIONS
        ? buildInstructionsContent
        : buildThresholdList;

    const configCharacter = getObj("character", state.BarThresholds.configId);
    configCharacter.set("bio", buildConfigNav() + buildCallback());
  }

  // --------------------------------------------------------------------------
  // Chat/Event Handling and Return
  // --------------------------------------------------------------------------

  function handleChatInput(message) {
    if (
      !playerIsGM(message.playerid) ||
      message.type !== "api" ||
      !/^!thresh/i.test(message.content)
    ) {
      return;
    }

    try {
      const {
        ADD_THRESHOLD,
        DELETE_THRESHOLD,
        EDIT_THRESHOLD,
        GET_IMGSRC,
        CONFIG,
        EXTERNAL_ONLY,
      } = COMMANDS;
      const { THRESHOLDS } = CONFIG_TABS;
      const [prefix, ...commandArgs] = message.content.split(/\|/g);
      const [keyword, editOrDeleteIndex, propertyToEdit] = prefix
        .split(/!thresh\s*|-/i)
        .filter((item) => item !== "");

      switch (keyword.toLowerCase()) {
        case ADD_THRESHOLD:
          state.BarThresholds[commandArgs[0]].push(
            createThreshold(message.selected, commandArgs)
          );
          buildConfigTab(THRESHOLDS);
          break;
        case EDIT_THRESHOLD:
          const editedThresholdValues = getEditedThresholdValues(
            propertyToEdit,
            message.selected,
            commandArgs
          );

          const barStateAfterEdit = _.map(
            state.BarThresholds[commandArgs[0]],
            (threshold, index) => {
              if (index === parseInt(editOrDeleteIndex)) {
                return _.extend({}, threshold, editedThresholdValues);
              }
              return threshold;
            }
          );

          state.BarThresholds[commandArgs[0]] = barStateAfterEdit;
          buildConfigTab(THRESHOLDS);
          break;
        case DELETE_THRESHOLD:
          if (commandArgs[1].toLowerCase() !== "confirm") {
            return;
          }
          const barStateAfterDelete = _.filter(
            state.BarThresholds[commandArgs[0]],
            (threshold, index) => index !== parseInt(editOrDeleteIndex)
          );

          state.BarThresholds[commandArgs[0]] = barStateAfterDelete;
          buildConfigTab(THRESHOLDS);
          break;
        case GET_IMGSRC:
          if (!message.selected) {
            throw new Error(
              `At least one token must be selected when using the <code>${GET_IMGSRC}</code> command.`
            );
          }

          _.each(message.selected, (selected) => {
            const token = getObj("graphic", selected._id);
            sendChat(
              THRESH_DISPLAY_NAME,
              `/w gm <div><div>${token.get("name")}</div>${getCleanImgsrc(
                token.get("imgsrc")
              )}</div>`,
              null,
              { noarchive: true }
            );
          });
          break;
        case CONFIG:
          buildConfigTab(commandArgs[0]);
          break;
        case EXTERNAL_ONLY:
          setExternalOnly(commandArgs);
          break;
        default:
          break;
      }
    } catch (error) {
      sendErrorMessage(error.message);
    }
  }

  function setConfigOnReady() {
    let configCharacter = findObjs({
      type: "character",
      name: THRESH_CONFIG_NAME,
    })[0];

    if (!configCharacter) {
      configCharacter = createObj("character", {
        name: THRESH_CONFIG_NAME,
      });

      state.BarThresholds.configId = configCharacter.id;
    } else if (
      !state.BarThresholds.configId ||
      state.BarThresholds.configId !== configCharacter.id
    ) {
      state.BarThresholds.configId = configCharacter.id;
    }

    if (!state.BarThresholds.currentTab) {
      state.BarThresholds.currentTab = CONFIG_TABS.INSTRUCTIONS;
      buildConfigTab(CONFIG_TABS.INSTRUCTIONS);
    }
  }

  function checkInstall() {
    if (!_.has(state, "BarThresholds")) {
      log("Installing " + THRESH_DISPLAY_NAME);
      state.BarThresholds = JSON.parse(JSON.stringify(DEFAULT_STATE));
    } else if (state.BarThresholds.version !== VERSION) {
      log("Updating to " + THRESH_DISPLAY_NAME);

      state.BarThresholds = _.extend(
        {},
        JSON.parse(JSON.stringify(DEFAULT_STATE)),
        state.BarThresholds
      );
      state.BarThresholds.version = VERSION;
    }

    setConfigOnReady();
    log(
      `${THRESH_DISPLAY_NAME} installed. Last updated ${new Date(
        LAST_UPDATED
      ).toLocaleDateString("en-US", {
        dateStyle: "long",
      })}.`
    );
  }

  function registerEventHandlers() {
    on("chat:message", handleChatInput);

    _.each([1, 2, 3], (barNumber) => {
      on(`change:graphic:bar${barNumber}_value`, (obj, prev) => {
        if (!state.BarThresholds.runExternalOnly) {
          runThresholds(`bar${barNumber}`, obj, prev[`bar${barNumber}_value`]);
        }
      });
    });
  }

  return {
    checkInstall,
    registerEventHandlers,
    runThresholds,
  };
})();

on("ready", () => {
  "use strict";

  BarThresholds.checkInstall();
  BarThresholds.registerEventHandlers();
});
