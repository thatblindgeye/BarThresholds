# BarThresholds

Thank you for installing BarThresholds! To suggest features or to report bugs, please create an issue at my [BarThresholds repo](https://github.com/thatblindgeye/BarThresholds).

The purpose of this script is to automate the process of having an effect occur when a token's bar value reaches a certain threshold. This effect can be either changing one or more token properties, removing a token from the current page, running an FX, or running a command from another script you have installed.

## BarThresholds Config

When this script is installed, a new character named BarThresholds Config will be created in your campaign. Each subsequent time the game is loaded a check will be made to make sure the character still exists, and to add it back if it doesn't.

This character is the main hub for instructions on how to use this script as well as editing and keeping track of your thresholds.

## Adding a Threshold

Each token bar has its own section in the "Thresholds" tab of the BarThresholds Config character bio. Clicking the "Add threshold" button within a section will trigger a series of dialogs for you to enter threshold data.

If any invalid values are entered when adding a threshold, an error will be whispered to the GM and the threshold will not be created.

### Threshold Frequency

This dialog determines when a threshold will actually run.

- **Every bar value update**: A threshold will run whenever a bar value increases, decreases, or changes in any way.
- **When bar value decreases**: A threshold will run only when the bar value decreases, checking the current value against the previous value.
- **When bar value increases**: A threshold will run only when the bar value increases, checking the current value against the previous value.

The "When bar value decreases" and "When bar value increases" frequencies can only be used when a bar value is expected to be only a number.

### Threshold Targets

This dialog determines which tokens a threshold will affect when it runs. The possible options are:

- **All tokens**: The threshold will affect every token.
- **Except selected tokens**: The threshold will affect all tokens except ones that are selected when the threshold is created.
- **Only selected tokens**: The threshold will affect only the tokens that are selected when the threshold is created.
- **GM Tokens**: The threshold will affect only tokens controlled by the GM. This includes tokens that do not have any players listed in the "Can Be Edited & Controlled By" field.
- **Player Tokens**: The threshold will affect only tokens controlled by at least one non-GM player, or by "all players".

When choosing the "Only selected tokens" or "Except selected tokens" option, the selected tokens are determined after clicking "Submit" on the final "Effect value(s)" step.

### Comparison Type

This dialog determines what comparison is made against the applicable bar value when a threshold runs for a threshold target. If a comparison returns `false` the threshold will stop running for the threshold target. The possible options are:

- **Equal to**: The comparison will return `true` only when the bar value is equal to the comparison value. This comparison type can be used for both numbers or strings, and the comparison does not check for strict equality. For example, if the comparison value is the number `5`, the comparison will return `true` when the bar value is either the number `5` or a string of `"5"`. Note that this is the only comparison type that can have non-integers or non-percentages entered as a comparison value.
- **Greater than**: The comparison will return `true` only when the bar value is greater than the comparison value.
- **Less than**: The comparison will return `true` only when the bar value is less than the comparison value.
- **Greater than or equal to**: The comparison will return `true` when the bar value is either greater than or equal to the comparison value.
- **Less than or equal to**: The comparison will return `true` when the bar value is either less than or equal to the comparison value.
- **Greater than X and Less than Y**: The comparison will return `true` only when the bar value is both greater than one comparison value and less than another comparison value.
- **Greater than or equal to X and Less than or equal to Y**: The comparison will return `true` only when the bar value is both greater than or equal to one comparison value, and less than or equal to another comparison value.

### Comparison Value(s)

This dialog determines the value to compare a bar value against in the comparison that is ran. You can enter either a string (e.g. `five`, only when using a comparison type of `Equal to`), an integer (e.g. `5`), or a percentage (e.g. `25%` or `0.25`, `1.0` for `100%`). The value cannot be left blank, unless the `Equal to` comparison type was selected.

When either the `Greater than X and Less than Y` or `Greater than or equal to X and Less than or equal to Y` comparison type is selected, you must enter two values as a comma separated list, e.g. `10, 20`. Additionally, the first value entered must be smaller than the second value entered, otherwise the threshold will not be created; a bar value cannot be both greater than (or equal to) 50 and less than (or equal to) 25.

When the `Greater than X and Less than Y` comparison type is selected, you must also make sure the two values entered are not the same; a bar value cannot be both greater than 50 and less than 50.

When a percentage is entered, the comparison value will be the specified percentage of the threshold target's bar max, rounded down. For example, if a value of `25%` is entered and a threshold target has a bar max of `50`, the comparison value will be `12` (50 x 25% = 12.5, rounded down to 12).

if a threshold target does not have a bar max set when a percentage is entered as the comparison value, the comparison will return `false` and the threshold will stop running for that target.

### Effect Types and Effect Value(s)

These two dialogs determine what effect will occur when a comparison returns `true`, and the actual value(s) of the chosen effect type. For all effect types except for "Remove token", a blank value will cause the threshold to not be created.

#### Add marker(s), Remove marker(s)

`<comma separated list of marker names>`
e.g. `red,blue`

These effect types will either add or remove the specified token markers to the threshold target. When the `Remove marker(s)` effect type is selected, all instances of the specified token markers will be removed from the threshold target.

Only valid marker names are allowed, otherwise an error will be whispered to the GM and the threshold will not be created.

Due to how custom markers must be set on tokens, a custom marker's tag will be rendered in the BarThresholds Config character bio, if one exists, instead of the marker name that is entered for the effect value. For example, if a custom marker named `skullbones` had a `tag` property with a value of `123456`, it would be rendered as `skullbones::123456`.

#### Add marker(s) and Remove marker(s)

`<comma separated list of markers to add & comma separated list of markers to remove>`
e.g. `red, blue & yellow, green`

This will first add the specified markers to the threshold target, then remove all instances of the specified token markers.

Only valid marker names are allowed, otherwise an error will be whispered to the GM and the threshold will not be created.

#### Move to layer

`<gmlayer|map|tokens>`

This will move the threshold target's token to the specified layer.

The "gmlayer" value alias is `gm`, the "map" value alias is `background`, and the "tokens" layer alias is `objects`.

#### Remove token

This will remove the threshold target's token from the tabletop.

This is the only effect type whose value can be left blank. While a value can be entered, it will not affect how the effect is ran.

#### Spawn FX

`<type-color|custom FX name>`

This will spawn an FX centered on the threshold target.

When using the `type-color` syntax, you can only use the default FX types and colors available from Roll20. The valid FX types are `bomb`, `bubbling`, `burn`, `burst`, `explode`, `glow`, `missile`, and `nova`, while the valid FX colors are `acid`, `blood`, `charm`, `death`, `fire`, `frost`, `holy`, `magic`, `slime`, `smoke`, and `water`.

When using the `custom FX name` syntax, you must enter a valid name of a custom FX in the campaign, and lettercase must match.

FX that require a second point to be chosen (such as `beam`, `breath`, `splatter`, or an FX with an `angle` of `-1`) cannot be used with this effect type.

#### Update aura 1, Update aura 2

`<0|radius, shape, color, optional show to players boolean>`
e.g. `5, circle, #ff0` or `5, circle, #ffff00, false`

These will update one of the two auras on the threshold target.

Passing in a value of `0` will turn the aura off on the threshold target.

The `radius` value must be a positive integer or decimal. The `shape` value must be either `circle` or `square`. The `color` value must be either `transparent` or a valid shorthand (3 characters) or longhand (6 characters) HEX value following a hash `#`.

By default, an aura radius is set to not be shown to players, so this value can be omitted if you do not want the aura to be shown to players and haven't previously set this value to `true`.

#### Update bar value

`<bar1|bar2|bar3, new value with optional + or - prefix>`
e.g. `bar1, 5` or `bar1, +2`

This will update a bar value on the threshold target.

Passing in a value without a prefixing `+` or `-` will set the specified bar's value. If `bar1`'s value is currently `5`, an effect value of `bar1, 10` will set `bar1`'s value to `10`.

Passing in a value with a prefixing `+` or `-` will add or subtract the specified amount from the current bar value. If `bar1`'s value is currently `5`, an effect value of `bar1, +2` will update `bar1`'s value to `7`.

#### Update multi-sided/rollable token side

`<integer|next|previous|random>`

This will update the current side for a multi-sided/rollable token.

When passing in an integer, the integer must be based on the side's position within the rollable token. For example, if you want to update a token's side to their second available side you would pass in `2`.

If the current token side is the last side available for the token and "next" is passed in, the token will be updated to its first side. If the current token side is the first side available for the token and "previous" is passed in, the token will be updated to its last side.

The "next" value alias is `+`, the "previous" value alis is `-` or `prev`, and the "random" value alis is `?`.

#### Update tint color

`<transparent|HEX color>`
e.g. `#ff0` or `#ffff00`

This will update the tint color for the threshold target.

A HEX color can either be shorthand (3 characters) or longhand (6 characters) following a hash `#`.

#### Update token image

`<valid image url>`

Similar to the `Update multi-sided/rollable token side` effect type, except this can be ran on non-rollable tokens to update the image of the token. This will permanently update the token's image.

When passing in an image URL as a value, you must pass in a URL for an image that is currently in your campaign, and it must be a "thumb" image.

In order to get a valid image URL, place the token with the image you want on the table top, select it, then send the `!thresh image` command in chat. This will whisper to the GM a valid image url that can be passed in as a value for this effect type.

#### Update token scale

`<positive integer or decimal with optional * prefix or px suffix>`
e.g. `5`, `*2`, or `150px`

This will update the scale of the threshold target's token.

Passing in an integer/decimal by itself will set the dimension sizes based on grid cells. For example, passing in `5` would set the token's width and height to the size of 5 grid cells.

Passing in an asterisk `*` before an integer/decimal will multiply the current dimension sizes by the specified value. For example, passing in `*2` would update the token's width and height to twice its current width and height.

Passing in an integer/decimal followed by `px` will set the current dimension sizes to the specified pixel value. For example, passing in `150px` would set the token's width and height to 150 pixels each.

When only a single value is passed in for this effect type, the value will update the token's width and height equally. If you want to update the width and height at different scales, you can pass in a comma separated list of two values. For example, passing in `5, *2` would cause the token's width to equal 5 grid cells, while the height would be updated to be twice its current height.

#### Custom command

This will allow you to run a custom command from another script you have installed. Keep in mind that you cannot run a custom command that relies on any selected tokens.

Due to how the BarThresholds script handles splitting apart its own commands to parse the various parameters, you must use the HTML entities for vertical pipes `|` and commas `,` when entering a custom command value. The HTML entitiy for vertical pipes is `&#124;`, and the HTML entity for commas is `&#44;`.

For example, to enter a custom command such as `!prefix keyword|option1, option2`, you would have to enter `!prefix keyword&#124;option1&#44; option2`.

## Editing and Deleting Thresholds

Each individual threshold can be edited or deleted after creation. For each threshold, you can click the "Threshold Frequency", "Threshold Targets", "Comparison", or "Effect" buttons to edit the respective properties of that threshold.

After clicking the "Delete threshold" button, a dialog asking you to confirm the deletion will appear, with the default selection being "Cancel" as a precaution to avoid accidental deletion.

## Other Commands

### Image

`!thresh image`

This will return a valid image URL of the selected token(s), which can be used for the `Update token image` effect type.

### External

`!thresh external|<optional boolean>`

By default, thresholds will run when a bar value change event within the BarThresholds script occurs, or when the exposed `BarThresholds.runThresholds` method is called in an external script (see the "Running Thresholds in External Scripts" section further below). Calling `!thresh external|false` will update to this behavior.

Calling `!thresh external|true` will update the behavior so that the only way for thresholds to run is by calling the exposed `BarThresholds.runThresholds` method in an external script. The potential use-case of this is to have more control over when thresholds run, and to avoid thresholds from potentially running twice in response to the same event.

Calling `!thresh external` will whisper the current behavior to the GM.

## Running Thresholds in External Scripts

`BarThresholds.runThresholds(bar, tokenObj, prevBarValue)`

The `runThresholds` method is exported from the BarThresholds script, allowing you to run thresholds in your own custom commands outside of the `change:graphic:barX_value` event. This can be especially useful if a token's bar value is set via Roll20's `set` method, as this will not trigger the `change:graphic:barX_value` events within the BarThresholds script.

When using the `runThresholds` method, you must pass in three parameters:

- The `bar` parameter determines which bar thresholds to run and must be a string of either `bar1`, `bar2`, or `bar3`.
- The `tokenObj` parameter must be an object that contains either an `id` or `_id` property. This determines whether the ID of the object is a valid threshold target.
- The `prevBarValue` parameter must be a string or number. This is used when determining whether a bar value update is valid for the specified frequency, and to prevent an effect from triggering multiple times within the same threshold.
