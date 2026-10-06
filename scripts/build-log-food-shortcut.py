# Builds public/automatic-food-logger/log-food.shortcut, the Log Food Shortcut
# that the Food Logger setup page offers as a download.
#
# Usage (macOS only, because signing uses the built-in `shortcuts` CLI):
#   python3 scripts/build-log-food-shortcut.py
#
# The Claude app's "Ask Claude" action cannot be generated here, so the
# Shortcut ships with a comment marking where to add it. Without it, meals
# logged with blank macros reach Health as empty samples.

import os
import plistlib
import subprocess
import tempfile
import uuid

REPOSITORY_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIGNED_SHORTCUT_PATH = os.path.join(REPOSITORY_ROOT, 'public', 'automatic-food-logger', 'log-food.shortcut')

# Keep in sync with CLAUDE_ESTIMATE_PROMPT in ShortcutSetupRoute.tsx.
CLAUDE_ESTIMATE_PROMPT_BEFORE_DESCRIPTION = 'Estimate the nutrition for this meal: '
CLAUDE_ESTIMATE_PROMPT_AFTER_DESCRIPTION = (
    '. Reply with only a JSON object and no code fences, exactly like '
    '{"kcal":650,"protein_g":40,"carbs_g":70,"fat_g":22}'
)

# Shortcuts stores Dietary Energy under its legacy name, "Dietary Calories".
HEALTH_SAMPLES_BY_PAYLOAD_KEY = [
    ('kcal', 'Dietary Calories', 'kcal'),
    ('protein_g', 'Protein', 'g'),
    ('carbs_g', 'Carbohydrates', 'g'),
    ('fat_g', 'Total Fat', 'g'),
]

# ---------- Shortcut plist helpers ----------


def new_action_uuid():
    return str(uuid.uuid4()).upper()


def variable_attachment(variable_reference):
    return {'Value': variable_reference, 'WFSerializationType': 'WFTextTokenAttachment'}


def action_output_reference(action_uuid, output_name):
    return {'Type': 'ActionOutput', 'OutputUUID': action_uuid, 'OutputName': output_name}


def shortcut_action(action_identifier, **action_parameters):
    return {'WFWorkflowActionIdentifier': action_identifier, 'WFWorkflowActionParameters': action_parameters}


# ---------- Log Food actions ----------


def build_log_food_actions():
    macros_variable_reference = {'Type': 'Variable', 'VariableName': 'Macros'}
    actions = []

    meal_dictionary_uuid = new_action_uuid()
    actions.append(shortcut_action(
        'is.workflow.actions.detect.dictionary',
        UUID=meal_dictionary_uuid,
        WFInput=variable_attachment({'Type': 'ExtensionInput'}),
    ))
    meal_dictionary_output = variable_attachment(action_output_reference(meal_dictionary_uuid, 'Dictionary'))

    calories_value_uuid = new_action_uuid()
    actions.append(shortcut_action(
        'is.workflow.actions.getvalueforkey',
        UUID=calories_value_uuid,
        WFDictionaryKey='kcal',
        WFInput=meal_dictionary_output,
    ))

    if_block_grouping_identifier = new_action_uuid()
    actions.append(shortcut_action(
        'is.workflow.actions.conditional',
        GroupingIdentifier=if_block_grouping_identifier,
        WFControlFlowMode=0,
        WFCondition=101,
        WFInput={
            'Type': 'Variable',
            'Variable': variable_attachment(action_output_reference(calories_value_uuid, 'Dictionary Value')),
        },
    ))

    description_value_uuid = new_action_uuid()
    actions.append(shortcut_action(
        'is.workflow.actions.getvalueforkey',
        UUID=description_value_uuid,
        WFDictionaryKey='description',
        WFInput=meal_dictionary_output,
    ))
    description_position = len(CLAUDE_ESTIMATE_PROMPT_BEFORE_DESCRIPTION)
    actions.append(shortcut_action(
        'is.workflow.actions.gettext',
        UUID=new_action_uuid(),
        WFTextActionText={
            'Value': {
                'string': CLAUDE_ESTIMATE_PROMPT_BEFORE_DESCRIPTION + '￼' + CLAUDE_ESTIMATE_PROMPT_AFTER_DESCRIPTION,
                'attachmentsByRange': {
                    '{%d, 1}' % description_position: action_output_reference(description_value_uuid, 'Dictionary Value'),
                },
            },
            'WFSerializationType': 'WFTextTokenString',
        },
    ))
    actions.append(shortcut_action(
        'is.workflow.actions.comment',
        WFCommentActionText='Add the Claude app\'s "Ask Claude" action here, below the Text above.',
    ))
    # No WFInput: the action reads the previous action's output, which is
    # Claude's reply once "Ask Claude" sits directly above it.
    estimated_macros_dictionary_uuid = new_action_uuid()
    actions.append(shortcut_action(
        'is.workflow.actions.detect.dictionary',
        UUID=estimated_macros_dictionary_uuid,
    ))
    actions.append(shortcut_action(
        'is.workflow.actions.setvariable',
        WFVariableName='Macros',
        WFInput=variable_attachment(action_output_reference(estimated_macros_dictionary_uuid, 'Dictionary')),
    ))

    actions.append(shortcut_action(
        'is.workflow.actions.conditional',
        GroupingIdentifier=if_block_grouping_identifier,
        WFControlFlowMode=1,
    ))
    actions.append(shortcut_action(
        'is.workflow.actions.setvariable',
        WFVariableName='Macros',
        WFInput=meal_dictionary_output,
    ))
    actions.append(shortcut_action(
        'is.workflow.actions.conditional',
        GroupingIdentifier=if_block_grouping_identifier,
        WFControlFlowMode=2,
        UUID=new_action_uuid(),
    ))

    for payload_key, health_sample_type, health_unit in HEALTH_SAMPLES_BY_PAYLOAD_KEY:
        macro_value_uuid = new_action_uuid()
        actions.append(shortcut_action(
            'is.workflow.actions.getvalueforkey',
            UUID=macro_value_uuid,
            WFDictionaryKey=payload_key,
            WFInput=variable_attachment(macros_variable_reference),
        ))
        actions.append(shortcut_action(
            'is.workflow.actions.health.quantity.log',
            UUID=new_action_uuid(),
            WFQuantitySampleType=health_sample_type,
            WFQuantitySampleQuantity={
                'Value': {
                    'Magnitude': variable_attachment(action_output_reference(macro_value_uuid, 'Dictionary Value')),
                    'Unit': health_unit,
                },
                'WFSerializationType': 'WFQuantityFieldValue',
            },
        ))

    actions.append(shortcut_action(
        'is.workflow.actions.setclipboard',
        WFInput=variable_attachment(macros_variable_reference),
    ))
    actions.append(shortcut_action(
        'is.workflow.actions.notification',
        UUID=new_action_uuid(),
        WFNotificationActionBody='Logged to Apple Health',
    ))
    return actions


# ---------- Build and sign ----------


def build_log_food_workflow():
    return {
        'WFWorkflowActions': build_log_food_actions(),
        'WFWorkflowClientVersion': '2607.0.2',
        'WFWorkflowMinimumClientVersion': 900,
        'WFWorkflowMinimumClientVersionString': '900',
        'WFWorkflowHasShortcutInputVariables': True,
        'WFWorkflowIcon': {'WFWorkflowIconStartColor': 4292093695, 'WFWorkflowIconGlyphNumber': 59511},
        'WFWorkflowImportQuestions': [],
        'WFWorkflowTypes': [],
        'WFQuickActionSurfaces': [],
        'WFWorkflowInputContentItemClasses': ['WFStringContentItem'],
        'WFWorkflowOutputContentItemClasses': [],
    }


def main():
    with tempfile.TemporaryDirectory() as temporary_directory:
        unsigned_shortcut_path = os.path.join(temporary_directory, 'Log Food.shortcut')
        with open(unsigned_shortcut_path, 'wb') as unsigned_shortcut_file:
            plistlib.dump(build_log_food_workflow(), unsigned_shortcut_file, fmt=plistlib.FMT_BINARY)
        subprocess.run(
            ['shortcuts', 'sign', '--mode', 'anyone', '--input', unsigned_shortcut_path, '--output', SIGNED_SHORTCUT_PATH],
            check=True,
        )
    print('Wrote ' + os.path.relpath(SIGNED_SHORTCUT_PATH, REPOSITORY_ROOT))


if __name__ == '__main__':
    main()
