/**
 * BarThresholds
 *
 * Version 1.2
 * Last updated: December 15, 2022
 * Author: thatblindgeye
 * GitHub: https://github.com/thatblindgeye
 */

const BarThresholds = (function () {
  "use strict";

  const campaignMarkers = [];

  // --------------------------------------------------------------------------
  // Constant Variables
  // --------------------------------------------------------------------------

  const VERSION = "1.2";
  const LAST_UPDATED = 1671108520274;
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
    bar1: [
      {
        frequency: FREQUENCY_TYPES.VAL_CHANGE,
        onlyTokens: [],
        exceptTokens: [],
        comparisonType: COMPARISON_TYPES.GREATER,
        comparisonValues: ["50%"],
        effectType: EFFECT_TYPES.ADD_REMOVE_MARKER,
        effectValues: [["green"], ["dead", "red", "yellow"]],
      },
      {
        frequency: FREQUENCY_TYPES.VAL_CHANGE,
        onlyTokens: [],
        exceptTokens: [],
        comparisonType: COMPARISON_TYPES.GREATER_LESS_EQUAL,
        comparisonValues: ["25%", "50%"],
        effectType: EFFECT_TYPES.ADD_REMOVE_MARKER,
        effectValues: [["yellow"], ["dead", "red", "green"]],
      },
      {
        frequency: FREQUENCY_TYPES.VAL_CHANGE,
        onlyTokens: [],
        exceptTokens: [],
        comparisonType: COMPARISON_TYPES.GREATER_LESS,
        comparisonValues: ["0", "25%"],
        effectType: EFFECT_TYPES.ADD_REMOVE_MARKER,
        effectValues: [["red"], ["dead", "yellow", "green"]],
      },
      {
        frequency: FREQUENCY_TYPES.VAL_CHANGE,
        onlyTokens: [],
        exceptTokens: [],
        comparisonType: COMPARISON_TYPES.LESS_EQUAL,
        comparisonValues: ["0"],
        effectType: EFFECT_TYPES.ADD_REMOVE_MARKER,
        effectValues: [["dead"], ["red", "yellow", "green"]],
      },
    ],
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

  function getMacroByName(macroName) {
    return findObjs(
      { _type: "macro", name: macroName },
      { caseInsensitive: true }
    );
  }

  function createMacros() {
    const gmPlayers = _.filter(
      findObjs({
        _type: "player",
      }),
      (player) => playerIsGM(player.get("_id"))
    );

    const getImgsrcName = "Thresh-Get-Imgsrc";
    const currentGetImgsrcMacro = getMacroByName(getImgsrcName);

    if (!currentGetImgsrcMacro.length) {
      createObj("macro", {
        _playerid: gmPlayers[0].get("_id"),
        name: getImgsrcName,
        action: "!thresh image",
        visibleto: _.pluck(gmPlayers, "id").join(","),
      });
    }
  }

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

    throw new Error(
      `The selected token does not have a valid image source. A token's image cannot be the default image, and the selected token cannot be one that was purchased on the Roll20 marketplace.`
    );
  }

  function getLonghandHex(color) {
    const colorAsArray = color.replace("#", "").split("");
    const longhandHex = _.map(
      colorAsArray,
      (character) => character + character
    ).join("");

    return `#${longhandHex}`;
  }

  function checkIsGmToken(token) {
    const character = getObj("character", token.get("represents"));
    if (!character) {
      // Means a token not linked to a character is used, so we want to assume
      // the token is being used by the GM.
      return true;
    }
    const controlledBy = character.get("controlledby");
    const playerIds = controlledBy.split(",");

    return (
      (!_.contains(playerIds, "all") &&
        _.every(playerIds, (id) => playerIsGM(id))) ||
      (playerIds.length === 1 && playerIds[0] === "")
    );
  }

  // --------------------------------------------------------------------------
  // Validation Functions
  // --------------------------------------------------------------------------

  function validateComparisonValues(type, compareValues) {
    const { EQUAL, GREATER_LESS, GREATER_LESS_EQUAL } = COMPARISON_TYPES;

    if (type !== EQUAL) {
      if (compareValues[0].trim() === "" && compareValues.length === 1) {
        throw new Error(
          `When using a comparison type other than <code>${EQUAL}</code>, the comparison value(s) cannot be blank.`
        );
      }

      const invalidValues = _.filter(
        compareValues,
        (value) => isNaN(parseFloat(value)) || !REGEX.INT_OR_PERCENT.test(value)
      ).join(", ");

      if (invalidValues) {
        throw new Error(
          `<div>The following values are not valid: <code>${invalidValues}</code></div><div>When using a comparison type other than <code>${EQUAL}</code>, any value(s) passed in must be a valid integer, e.g. <code>5</code> or <code>-5</code>, or a valid percentage, e.g. <code>25%</code>. A percentage may also be specified as a decimal between 0 and 1, e.g. <code>0.25</code> for 25% or <code>1.0</code> for 100%.</div>`
        );
      }
    }

    if (type === GREATER_LESS && compareValues[0] === compareValues[1]) {
      throw new Error(
        `When using the <code>${GREATER_LESS}</code> comparison types, the values passed in cannot be the same value. A threshold will not trigger because a bar value cannot be both greater than ${compareValues[0]} and less than ${compareValues[1]}.`
      );
    }

    if (type === GREATER_LESS || type === GREATER_LESS_EQUAL) {
      if (compareValues.length !== 2) {
        throw new Error(
          `When using the <code>${GREATER_LESS}</code> or <code>${GREATER_LESS_EQUAL}</code> comparison types you must pass in two values, with the first value being the "greater than..." comparison value and the second value being the "less than..." comparison value.`
        );
      }

      if (parseFloat(compareValues[0]) > parseFloat(compareValues[1])) {
        throw new Error(
          `When using the <code>${GREATER_LESS}</code> or <code>${GREATER_LESS_EQUAL}</code> comparison types, the first value passed in (the "greater..." comparison value) must be smaller than the second value passed in (the "less..." comparison value). A threshold will not trigger because a bar value cannot be both greater than (or equal to) <code>${compareValues[0]}</code> and less than (or equal to) <code>${compareValues[1]}</code>.`
        );
      }
    }

    return compareValues;
  }

  function validateColor(color) {
    if (!REGEX.COLOR_VALUE.test(color)) {
      throw new Error(
        `${color} is not a valid color value. Color value must either be <code>transparent</code>, or be in HEX format with exactly 3 or 6 characters following a hash <code>#</code>, e.g. <code>#f00</code> or <code>#ff0000</code>.`
      );
    }

    return color;
  }

  function validateEffectValues(type, effectValues) {
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
      (effectValues[0] === "" || effectValues[0][0] === "") &&
      effectValues.length === 1 &&
      type !== REMOVE_TOKEN
    ) {
      throw new Error(
        `Effect value(s) cannot be blank for the <code>${type}</code> effect type.`
      );
    }

    if ([ADD_MARKER, REMOVE_MARKER, ADD_REMOVE_MARKER].includes(type)) {
      const invalidMarkers = _.filter(
        _.flatten(effectValues),
        (effectValue) =>
          !_.findWhere(campaignMarkers, {
            name: effectValue,
          })
      );

      if (invalidMarkers.length) {
        throw new Error(
          `The following token markers do not exist in the campaign: <code>${invalidMarkers.join(
            ", "
          )}</code>. When using the <code>${type}</code> effect type, you must pass in valid token markers.`
        );
      }

      if (
        type === ADD_REMOVE_MARKER &&
        (effectValues.length !== 2 ||
          (effectValues[0][0] === "" && effectValues[0].length === 1) ||
          (effectValues[1][0] === "" && effectValues[1].length === 1))
      ) {
        throw new Error(
          `<code>${effectValues[0].join(" ")}, ${effectValues[1].join(
            " "
          )}</code> is not a valid effect value. When using the <code>${ADD_REMOVE_MARKER}</code> effect type, you must pass in a comma separated list of two values, with the first value being a space separated list of the token(s) to add and the second value being a space separated list of the token(s) to remove.<br/><br/>For example, <code>red yellow, blue green</code> would add the "red" and "yellow" markers, and remove the "blue" and "green" markers.`
        );
      }

      return effectValues;
    }

    if (type === SCALE) {
      const invalidScaleValues = _.filter(
        effectValues,
        (scaleValue) => !REGEX.SCALE.test(scaleValue)
      );

      if (invalidScaleValues.length) {
        throw new Error(
          `The following values are not valid: <code>${invalidScaleValues.join(
            ", "
          )}</code><br/><br/>When using the <code>${SCALE}</code> effect type, the value(s) passed in must be either an integer/decimal, an asterisk <code>*</code> followed by an integer/decimal, or an integer/decimal followed by <code>px</code>.`
        );
      }

      return effectValues;
    }

    if (type === TINT) {
      validateColor(effectValues[0]);

      return effectValues;
    }

    if (type === AURA_1 || type === AURA_2) {
      validateColor(effectValues[2]);

      if (effectValues[3] && !REGEX.BOOLEAN.test(effectValues[3])) {
        throw new Error(
          `${effectValues[3]} is not a valid boolean value. When passing in the optional parameter for showing an aura to players, you must pass in a valid boolean value of <code>true</code> or <code>false</code>.`
        );
      }

      if (effectValues.length < 3 && parseInt(effectValues[0]) !== 0) {
        throw new Error(
          `When using the <code>${AURA_1}</code> or <code>${AURA_2}</code> effect types, you must either pass in a comma separated list of values formatted as <code>radius, shape, color, optional boolean to show the aura to players</code>, or <code>0</code> to turn the aura off.`
        );
      }

      if (!REGEX.AURA_RADIUS.test(effectValues[0])) {
        throw new Error(
          `${effectValues[0]} is not a valid value for the aura radius. Aura radius must be a positive integer, e.g. <code>5</code>, or <code>0</code> to remove the aura.`
        );
      }

      if (!REGEX.AURA_SHAPE.test(effectValues[1].trim())) {
        throw new Error(
          `${effectValues[1]} is not a valid value for the aura shape. You must pass in either <code>square</code> or <code>false</code> or <code>circle</code> as an aura shape value.`
        );
      }

      return effectValues;
    }

    if (type === LAYER) {
      if (!REGEX.LAYER.test(effectValues[0])) {
        throw new Error(
          `<code>${effectValues[0]}</code> is not a valid layer. When using the <code>${LAYER}</code> effect type, you must enter a value of either <code>gm</code>, <code>objects</code>, or <code>map</code>.`
        );
      }

      return effectValues;
    }

    if (type === IMGSRC) {
      if (!REGEX.IMAGE.test(effectValues[0])) {
        throw new Error(
          `<code>${effectValues[0]}</code> is not a valid imgsrc. When using the <code>${IMGSRC}</code> effect type, the imgsrc must be the "thumb" version and in a PNG/JPG/JPEG/GIF format.<br/><br/>To get the "thumb" version of an imgsrc, select the graphic with the desired image on the tabletop and call the <code>${COMMANDS.GET_IMGSRC}</code> command.`
        );
      }

      return effectValues;
    }

    if (type === TOKEN_SIDE) {
      if (!REGEX.NEW_SIDE.test(effectValues[0])) {
        throw new Error(
          `<code>${effectValues[0]}</code> is not a valid value. When using the <code>${TOKEN_SIDE}</code> effect type, you must pass in an integer, a plus sign <code>+</code>, or a minus sign <code>-</code>.`
        );
      }

      return effectValues;
    }

    if (type === BAR) {
      if (effectValues.length !== 2) {
        throw new Error(
          `When using the <code>${BAR}</code> effect type, you must pass in a comma separated list of two values. The first value must be the bar target, and the second value must be the new value of the bar.`
        );
      }

      if (!REGEX.BAR_NUMBER.test(effectValues[0])) {
        throw new Error(
          `<code>${effectValues[0]}</code> is not a valid bar. When using the <code>${BAR}</code> effect type, the first value must be the string <code>bar</code> immediately followed by the number 1, 2, or 3.`
        );
      }

      if (!REGEX.BAR_VALUE.test(effectValues[1])) {
        throw new Error(
          `<code>${effectValues[1]}</code> is not a value value. When using the <code>${BAR}</code> effect type, the new value for the bar target must be either a number or string, a plus sign <code>+</code> followed by a number, or a minus sign <code>-</code> followed by a number.`
        );
      }

      return effectValues;
    }

    if (type === FX) {
      if (/\-/.test(effectValues[0])) {
        const [fxType, fxColor] = effectValues[0].split("-");

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

        return effectValues;
      } else {
        const customFx = findObjs({
          _type: "custfx",
          name: effectValues[0],
        })[0];

        if (!customFx) {
          throw new Error(
            `<code>${effectValues[0]}</code> is not a valid custom FX. Make sure the custom FX exists in the campaign and that the spelling and lettercase is correct.`
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
    const { COMMAND, ADD_MARKER, REMOVE_MARKER, ADD_REMOVE_MARKER } =
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
      .split(/\s*\&\s*/)
      .map((effectValue) => trimWhitespace(effectValue));

    if ([ADD_MARKER, REMOVE_MARKER, ADD_REMOVE_MARKER].includes(effectType)) {
      const splitMarkerArrays = _.map(splitEffectValues, (effectValue) =>
        effectValue.split(/\s*,\s*/)
      );

      const markersByTag = validateEffectValues(
        effectType,
        splitMarkerArrays
      ).map((markerArray) =>
        markerArray.map((marker) => {
          const markerObj = _.findWhere(campaignMarkers, { name: marker });

          return markerObj.tag || markerObj.name;
        })
      );

      return {
        [EFFECT_VALUES]: markersByTag,
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
        : getLonghandHex(auraValues[2]);
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
    const tokenSides = _.map(token.get("sides").split("|"), decodeURIComponent);
    if (tokenSides.length === 1 && !tokenSides[0]) {
      sendErrorMessage(
        `${
          token.get("name") || "Unnamed Token"
        } is not a multi-sided/rollable token and cannot have its side updated.`
      );

      return;
    }

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

    if (tokenSides[sideToGet] && sideToGet !== currentSide) {
      token.set({
        imgsrc: getCleanImgsrc(tokenSides[sideToGet]),
        currentSide: sideToGet,
      });
    } else if (!tokenSides[sideToGet]) {
      sendErrorMessage(
        `Could not update multi-sided/rollable token side for ${
          token.get("name") || "Unnamed Token"
        }. Side at index <code>${sideToGet}</code> does not exist.`
      );
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
      case REMOVE_MARKER:
      case ADD_REMOVE_MARKER:
        setMarkers(token, effectType, effectValues);
        break;
      case SCALE:
        setScale(token, effectValues);
        break;
      case TINT:
        const currentTint = token.get("tint_color");
        const newTint =
          effectValues[0].length === 7
            ? effectValues[0]
            : getLonghandHex(effectValues[0]);

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
          <h3>Threshold Frequency</h3>
          <p>This dialog determines when a threshold will actually run.</p>
          <ul>
          <li><span style="font-weight: bold;">Every bar value update</span>: The threshold will run whenever a bar value increases, decreases, or changes in any way.</li>
          <li><span style="font-weight: bold;">When bar value decreases</span>: The threshold will run only when the bar value decreases, checking the current value against the previous value.</li>
          <li><span style="font-weight: bold;">When bar value increases</span>: The threshold will run only when the bar value increases, checking the current value against the previous value.</li>
          </ul>
          <p>The "When bar value decreases" and "When bar value increases" frequencies can only be used when a bar value is expected to be only a number.</p>
          <h3>Threshold Targets</h3>
            <p>This dialog determines which tokens a threshold will affect. The possible options are:</p>
            <ul>
              <li><span style="font-weight: bold;">All tokens</span>: The threshold will affect every token.</li>
              <li><span style="font-weight: bold;">Only selected tokens</span>: The threshold will affect only the tokens that are selected when the threshold is created.</li>
              <li><span style="font-weight: bold;">Except selected tokens</span>: The opposite of the previous option. The threshold will affect all tokens except ones that are selected when the threshold is created.</li>
              <li><span style="font-weight: bold;">GM tokens</span>: The threshold will affect only tokens controlled by the GM. This includes tokens that do not have any players listed in the "Can Be Edited & Controlled By" field or tokens not linked to a character sheet.</li>
              <li><span style="font-weight: bold;">Player tokens</span>: The threshold will affect only tokens controlled by at least one non-GM player, or by "all players".</li>
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
          <h3>Effect Type and Value</h3>
            <p>These two dialogs determine what effect will occur when a comparison returns <code>true</code>, and the actual value(s) of the chosen effect type. For all effect types except for "Remove token", a blank value will cause the threshold to not be created.</p>
            <ul>
              <li><span style='font-weight: bold;'>Add marker(s), Remove markers(s)</span><p><code>[comma separated list of marker names]</code>, e.g. <code>red, blue</code></p><p>These effect types will either add or remove the specified token markers to the threshold target. When the <code>Remove marker(s)</code> effect type is selected, all instances of the specified token markers will be removed from the threshold target.</p><p>Only valid marker names are allowed, otherwise an error will be whispered to the GM and the threshold will not be created.</p><p>Due to how custom markers must be set on tokens, a custom marker's tag will be rendered in the BarThresholds Config character bio, if one exists, instead of the marker name that is entered for the effect value. For example, if a custom marker named <code>skullbones</code> had a <code>tag</code> property with a value of <code>123456</code>, it would be rendered as <code>skullbones::123456</code>.</p></li>
              <li><span style='font-weight: bold;'>Add marker(s) and Remove marker(s)</span><p><code>[comma separated list of markers to add & comma separated list of markers to remove]</code>, e.g. <code>red, blue & yellow, green</code></p><p>This will first add the specified markers to the threshold target, then remove all instances of the specified token markers.</p><p>Only valid marker names are allowed, otherwise an error will be whispered to the GM and the threshold will not be created.</p></li>
              <li><span style='font-weight: bold;'>Move to layer</span><p><code>[gmlayer|map|tokens]</code></p><p>This will move the threshold target's token to the specified layer.</p><p>The <code>gmlayer</code> layer alias is <code>gm</code>, the <code>map</code> layer alias is <code>background</code>, and the <code>tokens</code> layer alias is <code>objects</code>.</p></li>
              <li><span style='font-weight: bold;'>Remove token</span><p>This will remove the threshold target's token from the tabletop.</p><p>This is the only effect type whose value can be left blank. While a value can be entered, it will not affect how the effect is ran.</p></li>
              <li><span style='font-weight: bold;'>Spawn FX</span><p><code>[type-color|custom FX name]</code>, e.g. <code>bomb-blood</code> or <code>BloodiedFX</code></p><p>This will spawn an FX centered on the threshold target.</p><p>When using the <code>type-color</code> syntax, you can only use the default FX types and colors available from Roll20. The valid FX types are <code>bomb</code>, <code>bubbling</code>, <code>burn</code>, <code>burst</code>, <code>explode</code>, <code>glow</code>, <code>missile</code>, and <code>nova</code>, while the valid FX colors are <code>acid</code>, <code>blood</code>, <code>charm</code>, <code>death</code>, <code>fire</code>, <code>frost</code>, <code>holy</code>, <code>magic</code>, <code>slime</code>, <code>smoke</code>, and <code>water</code>.</p><p>When using the <code>custom FX name</code> syntax, you must enter a valid name of a custom FX in the campaign, and lettercase must match.</p><p>FX that require a second point to be chosen (such as <code>beam</code>, <code>breath</code>, <code>splatter</code>, or an FX with an <code>angle</code> of <code>-1</code>) cannot be used with this effect type.</p></li>
              <li><span style='font-weight: bold;'>Update aura 1, Update aura 2</span><p><code>[0|radius, shape, transparent|HEX color, optional show to players boolean]</code>, e.g. <code>5, circle, #ff0</code> or <code>5, circle, #ffff00, false</code></p><p>These will update one of the two auras on the threshold target.</p><p>Passing in a value of <code>0</code>, either on its own or to the <code>radius</code> argument, will turn the aura off on the threshold target.</p><p>The <code>radius</code> value must be a positive integer or decimal. The <code>shape</code> value must be either <code>circle</code> or <code>square</code>. The <code>color</code> value must be either <code>transparent</code> or a valid shorthand (3 characters) or longhand (6 characters) HEX value following a hash <code>#</code>.</p></li>
              <li><span style='font-weight: bold;'>Update bar value</span><p><code>[bar1|bar2|bar3, new value with optional + or - prefix]</code>, e.g. <code>bar1, 5</code> or <code>bar1, +2</code></p><p>This will update a bar value on the threshold target.</p><p>Passing in a value without a prefixing <code>+</code> or <code>-</code> will set the specified bar's value. If <code>bar1</code>'s value is currently <code>5</code>, an effect value of <code>bar1, 10</code> will set <code>bar1</code>'s value to <code>10</code>.</p><p>Passing in a value with a prefixing <code>+</code> or <code>-</code> will add or subtract the specified amount from the current bar value. If <code>bar1</code>'s value is currently <code>5</code>, an effect value of <code>bar1, +2</code> will update <code>bar1</code>'s value to <code>7</code>.</p></li>
              <li><span style='font-weight: bold;'>Update multi-sided/rollable token side</span><p><code>[integer|next|previous|random]</code></p><p>This will update the current side for a multi-sided/rollable token.</p><p>When passing in an integer, the integer must be based on the side's position within the rollable token. For example, if you want to update a token's side to their second available side you would pass in <code>2</code>.</p><p>If the current token side is the last side available for the token and <code>next</code> is passed in, the token will be updated to its first side. If the current token side is the first side available for the token and <code>previous</code> is passed in, the token will be updated to its last side.</p><p>The <code>next</code> value alias is <code>+</code>, the <code>previous</code> value alis is <code>-</code> or <code>prev</code>, and the <code>random</code> value alis is <code>?</code>.</p></li>
              <li><span style='font-weight: bold;'>Update tint color</span><p><code>[transparent|HEX color]</code></p><p>This will update the tint color for the threshold target.</p><p>A HEX color can either be shorthand (3 characters) or longhand (6 characters) following a hash <code>#</code>.</p></li>
              <li><span style='font-weight: bold;'>Update token image</span><p><code>[valid image url]</code></p><p>Similar to the "Update multi-sided/rollable token side" effect type, except this can be ran on non-rollable tokens to update the image of the token. This will permanently update the token's image.</p><p>When passing in an image URL as a value, you must pass in a URL for an image that is currently in your campaign, and it must be a "thumb" image.</p><p>In order to get a valid image URL, place the token with the image you want on the table top, select it, then send the <code>!thresh image</code> command in chat. This will whisper to the GM a valid image url that can be passed in as a value for this effect type.</p></li>
              <li><span style='font-weight: bold;'>Update token scale</span><p><code>[positive integer or decimal with optional * prefix or px suffix]</code>, e.g. <code>5</code>, <code>*2</code>, or <code>150px</code></p><p>This will update the scale of the threshold target's token.</p><p>Passing in an integer/decimal by itself will set the dimension sizes based on grid cells. For example, passing in <code>5</code> would set the token's width and height to the size of 5 grid cells.</p><p>Passing in an asterisk <code>*</code> before an integer/decimal will multiply the current dimension sizes by the specified value. For example, passing in <code>*2</code> would update the token's width and height to twice its current width and height.</p><p>Passing in an integer/decimal followed by <code>px</code> will set the current dimension sizes to the specified pixel value. For example, passing in <code>150px</code> would set the token's width and height to 150 pixels each.</p><p>When only a single value is passed in for this effect type, the value will update the token's width and height equally. If you want to update the width and height at different scales, you can pass in a comma separated list of two values. For example, passing in <code>5, *2</code> would cause the token's width to equal 5 grid cells, while the height would be updated to be twice its current height.</p></li>
              <li><span style='font-weight: bold;'>Custom command</span><p>This will allow you to run a custom command from another script you have installed. You cannot run a custom command that relies on any selected tokens.</p><p>Due to how the BarThresholds script handles splitting apart its own commands to parse the various parameters, you must use the HTML entities for vertical pipes <code>|</code> and commas <code>,</code> when entering a custom command value. The HTML entitiy for vertical pipes is <code>&#124;</code>, and the HTML entity for commas is <code>&#44;</code></p><p>For example, to enter a custom command such as <code>!prefix keyword|option1, option2</code>, you would have to enter <code>!prefix keyword&#124;option1&#44; option2</code>.</p></li>
            </ul>
        <h2>Editing and Deleting Thresholds</h2>
          <p>Each individual threshold can be edited or deleted after creation. For each threshold, you can click the "Threshold Targets", "Comparison", or "Effect" buttons to edit the related properties of that threshold.</p>
          <p>After clicking the "Delete threshold" button, a dialog asking you to confirm the deletion will appear, with the default selection being "Cancel" as a precaution to avoid accidental deletion.</p>
        <h2>Other Commnands</h2>
          <h3>Image</h3>
          <p><code>!thresh image</code></p>
          <p>This will return a valid image URL of the selected token(s), which can be used for the "Update token image" effect type.</p>
          <h3>External</h3>
          <p><code>!thresh external|[optional boolean]</code></p>
          <p>By default, thresholds will run when a bar value change event within the BarThresholds script occurs, or when the exposed <code>BarThresholds.runThresholds</code> method is called in an external script (see the "Running Thresholds in External Scripts" section further below). Calling <code>!thresh external|false</code> will update to this behavior.</p>
          <p>Calling <code>!thresh external|true</code> will update the behavior so that the only way for thresholds to run is by calling the exposed <code>BarThresholds.runThresholds</code> method in an external script. The potential use-case of this is to have more control over when thresholds run, and to avoid thresholds from potentially running twice in response to the same event.</p>
          <p>Calling <code>!thresh external</code> will whisper the current behavior to the GM.</p>
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
          ", "
        )}<span style="${thresholdCardSeparatorCSS}">Remove marker(s): ${threshold[
          EFFECT_VALUES
        ][1].join(", ")}</span>`;
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
            const imgURL = getCleanImgsrc(token.get("imgsrc"));

            sendChat(
              THRESH_DISPLAY_NAME,
              `/w gm <div style="padding: 8px; border: 1px solid gray; border-radius: 25px;"><img src="${imgURL}" alt="${token.get(
                "name"
              )} token"/><div><code>${imgURL}</code></div></div>`,
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

    campaignMarkers.push(
      ...JSON.parse(Campaign().get("token_markers")),
      ...ROLL20_MARKERS
    );
  }

  function checkInstall() {
    if (!_.has(state, "BarThresholds")) {
      log("Installing " + THRESH_DISPLAY_NAME);
      state.BarThresholds = JSON.parse(JSON.stringify(DEFAULT_STATE));
      createMacros();
      log("Thresh-Get-Imgsrc macro created...");
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
      })}. Visit the Journal tab for the BarThresholds Config character.`
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
