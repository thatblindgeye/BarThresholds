# BarThresholds

Thank you for installing BarThresholds! To suggest features or to report bugs, please create an issue at my [BarThresholds repo](https://github.com/thatblindgeye/BarThresholds).

The purpose of this script is to automate the process of having an effect occur when a token's bar value reaches a certain threshold. This effect can be either changing one or more token properties, or running a command from another script you have installed.

## Adding a Threshold

Each token bar has its own section in the "Thresholds" tab of the BarThresholds Config character bio. Clicking the "Add threshold" button within a section will trigger a series of dialogs for you to enter threshold data.

If any invalid values are entered when adding a threshold, an error will be whispered to the GM and the threshold will not be created.

### Threshold Targets

This dialog determines which tokens a threshold will affect. The possible options are:

- **All tokens**: The threshold will affect every token.
- **Only selected tokens**: The threshold will affect only the tokens that are selected when the threshold is created.
- **Except selected tokens**: The opposite of the previous option. The threshold will affect all tokens except ones that are selected when the threshold is created.

When choosing the "Only selected tokens" or "Except selected tokens" option, you should ensure you select any tokens before clicking "submit" on the final "Effect value(s)" step.

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

This dialog determines the value to compare a bar value against in the comparison that is ran. You can enter either a string (e.g. `five`, only when using a comparison type of `Equal to`), an integer (e.g. `5`), or a percentage (e.g. `25%`). The value cannot be left blank, unless the `Equal to` comparison type was selected.

When either the `Greater than X and Less than Y` or `Greater than or equal to X and Less than or equal to Y` comparison type is selected, you must enter two values as a comma separated list, e.g. `10, 20`. Additionally, the first value entered must be smaller than the second value entered, otherwise the threshold will not be created; a bar value cannot be both greater than (or equal to) 50 and less than (or equal to) 25.

When the `Greater than X and Less than Y` comparison type is selected, you must also make sure the two values entered are not the same; a bar value cannot be both greater than 50 and less than 50.

When a percentage is entered, the comparison value will be the specified percentage of the threshold target's bar max, rounded down. For example, if a value of `25%` is entered and a threshold target has a bar max of `50`, the comparison value will be `12` (50 x 25% = 12.5, rounded down to 12).

if a threshold target does not have a bar max set when a percentage is entered as the comparison value, the comparison will return `false` and the threshold will stop running for that target.

### Effect Type

This dialog determines what effect will occur when a comparison returns `true`. The possible options are:

- **Add marker**: This will add a single marker to the threshold target. This effect will only add the marker if the threshold target does not already have it applied.
- **Remove marker**: This will remove a single marker from the threshold target. If the target has multiple of the specified marker, all instances of that marker will be removed.
- **Add marker and Remove marker**: This will add one marker to the threshold target, and remove another marker from them.
- **Update tint color**: This will update the tint color for the threshold target.
- **Update aura 1** and **Update aura 2**: This will update one of the two aura's on the threshold target.
- **Custom command**: This effect type allows you to enter a custom command from another script you have installed in the campaign. Note that you cannot run custom commands that rely on any selected tokens when the command is called. To do so you would have to setup your own logic and call the exposed `BarThresholds.runThresholds` method externally (see the "Running Thresholds in External Scripts" section further below).

### Effect Value(s)

This dialog determines the actual value(s) of the chosen effect type. If left blank, the threshold will not be created. Valid values for each effect type are as follows:

- When either the `Add marker`, `Remove marker`, or `Add marker and Remove marker` effect types are selected, you must enter a marker name that exists in your campaign, otherwise the threshold will not be created.
- When the `Add marker and Remove marker` effect type is selected, you must enter a comma separated list of values, with the first value being the marker to add and the second value being the marker to remove. For example, `red, yellow` would add the "red" marker and remove the "yellow" marker.
- When the `Update tint color` effect type is selected, you must enter a HEX color with 6 digits, e.g. `#ff0000`, or `transparent`. Shorthand HEX values are not allowed.
- When either the `Update aura 1` or `Update aura 2` effect type is selected, you must enter a value of either `0` to turn the aura off or a comma separated list formatted as `aura radius, aura shape, aura color, optional boolean to show the aura to players`.

  The aura radius must be a positive number, either an integer or decimal. The aura shape must either be a value of `circle` or `square`. The aura color must be a HEX color with 6 digits (shorthand HEX values are not allowed) or `transparent`.

  By default, an aura radius is set to not be shown to players, so this value can be omitted if you do not want the aura to be shown to players when set via the threshold.

- When the `Custom command` effect type is selected, due to how the BarThresholds script handles splitting apart its own commands to parse the various parameters, you must use the HTML entities for vertical pipes `|` and commas `,`. The HTML entitiy for vertical pipes is `&#124;`, and the HTML entity for commas is `&#44;`. BarThresholds will replace these entities to the respective characters so that the commands will run correctly when the threshold is triggered. For example, to enter a custom command such as `!prefix keyword|option1, option2`, you would have to enter `!prefix keyword&#124;option1&#44; option2`.

  You cannot use the `Custom command` effect type to run a command that requires selected tokens to be passed in.

## Editing and Deleting Thresholds

Each individual threshold can be edited or deleted after creation. For each threshold, you can click the "Threshold Targets", "Comparison", or "Effect" buttons to edit the respective properties of that threshold.

After clicking the "Delete threshold" button, a dialog asking you to confirm the deletion will appear, with the default selection being "Cancel" as a precaution to avoid accidental deletion.

## Setting for Running Thresholds

`!thresh external|<optional true or false>`

By default, thresholds will run when a bar value change event within the BarThresholds script occurs, or when the exposed `BarThresholds.runThresholds` method is called in an external script (see the "Running Thresholds in External Scripts" section further below). Calling `!thresh external|false` will update to this behavior.

Calling `!thresh external|true` will update the behavior so that the only way for thresholds to run is by calling the exposed `BarThresholds.runThresholds` method in an external script. The potential use-case of this is to have more control over when thresholds run, and to avoid thresholds from potentially running twice in response to the same event.

Calling `!thresh external` will whisper the current behavior to the GM.

## Running Thresholds in External Scripts

`BarThresholds.runThresholds(bar, tokenID)`

The `runThresholds` method is exported from the BarThresholds script, allowing you to run thresholds in your own custom commands outside of the `change:graphic:barX_value` event. This can be especially useful if a token's bar value is set via Roll20's `set` method, as this will not trigger the `change:graphic:barX_value` events within the BarThresholds script.

When using the `runThresholds` method, you must pass in two parameters: a `bar` and a `tokenID`:

- The `bar` parameter determines which bar thresholds to run and must be a string of either "bar1", "bar2", or "bar3".
- The `tokenID` parameter determines whether the token with that ID is a valid threshold target. This can either be manually passed in as a string, e.g. `"-N8u_AM_kks6if4OUmhT"`, or it can be passed in by accessing the `id` property on an object, e.g. `obj.id`.
