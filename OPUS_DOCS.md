Quickstart Guide
Before running your first job programmatically on the Opus platform, you need to ensure the following prerequisites are in place.



Authentication & Base URL

All API requests must be made to the following base URL and include the x-service-key header for authentication.



Base URL: https://operator.opus.com
Authentication Header: x-service-key: <your_service_key>


Obtaining your API Key

The x-service-key is your unique, secret API key for authenticating your requests. Follow these steps to generate one:



In the Opus platform, navigate to your Organization settings by clicking the My Organization tab at the top of the screen.

Click the gear icon next to your Organization's name to open its settings.

From the settings menu on the left, select API Keys.

Click the + Generate API Key button.

A modal will appear. You can enter an optional Key Name for your reference.

Click the Generate Key button.

Your new x-service-key will be displayed. This is the only time the key will be shown. You must copy this key immediately and store it in a secure location.

After creation, your key will be listed in the API Keys panel. Here you can see its name, creation date, expiration date, and an option to Delete the key.


Finding your Workflow ID

The workflow_id is the unique identifier for the specific workflow you want to trigger. This ID is found in the URL of your Opus environment.

You can find this ID in two common places:


From the Workflow Details Page: Navigate to the Workflows tab in your Opus application, find your workflow, and click on it. The URL in your browser will show the ID.

From the Canvas Builder: Open your workflow in the builder canvas. The URL in your browser will also contain the ID.

In both cases, the URL will follow this pattern. The Workflow ID is the value immediately after .../workflow/.

Your URL will look like: app.opus.com/app/workflow/{workflow_id_here}


For example, in the URL app.opus.com/app/workflow/B9uGJfZ3CFwOdMKH, the Workflow ID is B9uGJfZ3CFwOdMKH.



Get Workflow Details & Schema
GET /workflow/ {workflow_Id}



Before you can execute a job, you must know what inputs it expects. This endpoint provides the exact schema for all required inputs for a workflow with a given workflow_id.

The response is a large JSON object containing the workflow's name, description, blueprint, and, most importantly, the jobPayloadSchema.



Parameters

workflowId *required string (path)

ID of the workflow to retrieve details for


Headers

x-service-key: <your_service_key>


Responses

Code : 200

Media Type : application/json *Controls accept header



Example response:

{
  "createdAt": "2023-10-05T14:48:00.000Z",
  "workflowId": "workflow-123",
  "name": "workflow-123",
  "description": "workflow-123",
  "industry": "workflow-123",
  "active": true,
  "workflowBlueprint": {
    "id": "blueprint-123",
    "name": "My Workflow Blueprint",
    "objective": "To automate a specific process",
    "description": "This blueprint defines the workflow process.",
    "input": {
      "description": "This is a workflow IO description.",
      "inputItems": [
        {
          "description": "This is a workflow item description.",
          "workflowInputItemClassificationTags": [
            "tag1",
            "tag2"
          ],
          "workflowOutputItemClassificationTags": [
            "tag3",
            "tag4"
          ]
        }
      ],
      "outputItems": [
        {
          "description": "This is a workflow item description.",
          "workflowInputItemClassificationTags": [
            "tag1",
            "tag2"
          ],
          "workflowOutputItemClassificationTags": [
            "tag3",
            "tag4"
          ]
        }
      ]
    },
    "output": {
      "description": "This is a workflow IO description.",
      "inputItems": [
        {
          "description": "This is a workflow item description.",
          "workflowInputItemClassificationTags": [
            "tag1",
            "tag2"
          ],
          "workflowOutputItemClassificationTags": [
            "tag3",
            "tag4"
          ]
        }
      ],
      "outputItems": [
        {
          "description": "This is a workflow item description.",
          "workflowInputItemClassificationTags": [
            "tag1",
            "tag2"
          ],
          "workflowOutputItemClassificationTags": [
            "tag3",
            "tag4"
          ]
        }
      ]
    },
    "process": {
      "description": "This is a workflow IO description.",
      "inputItems": [
        {
          "description": "This is a workflow item description.",
          "workflowInputItemClassificationTags": [
            "tag1",
            "tag2"
          ],
          "workflowOutputItemClassificationTags": [
            "tag3",
            "tag4"
          ]
        }
      ],
      "outputItems": [
        {
          "description": "This is a workflow item description.",
          "workflowInputItemClassificationTags": [
            "tag1",
            "tag2"
          ],
          "workflowOutputItemClassificationTags": [
            "tag3",
            "tag4"
          ]
        }
      ]
    },
    "requiredSteps": [
      {
        "stepNumber": 1,
        "input": "input-data",
        "output": "output-data",
        "objective": "Achieve a specific goal",
        "description": "This step processes the input data.",
        "constraint": "Must be completed within 2 hours",
        "workflowStepClassificationTags": [
          "step-tag1",
          "step-tag2"
        ]
      }
    ],
    "workflowClassificationTags": [
      "classification-tag1",
      "classification-tag2"
    ],
    "dataSets": [
      "dataset1",
      "dataset2"
    ],
    "embeddingText": "Embedding text example",
    "generationMarker": {
      "key": "value"
    },
    "industry": "finance",
    "country": "USA",
    "storageMarker": {
      "key": "value"
    }
  },
  "executionEstimation": {
    "humanCost": 100.5,
    "humanPrice": 150.75,
    "opusCost": 50.25,
    "opusPrice": 75.5,
    "humanTime": 2.5,
    "opusTime": 1.2,
    "accuracy": 95
  },
  "workflowImage": "https://example.com/workflow-image.png",
  "jobPayloadSchema": {},
  "jobResultsPayloadSchema": {
    "additionalProp1": {}
  }
}

jobPayloadSchema Example

From the above schema, the jobPayloadSchema object defines all workflow inputs, their unique variable names (e.g., workflow_input_we4tej0ly), and their data types (e.g., str, file, bool).



You will use this exact structure to build your job execution request to Opus.



Example jobPayloadSchema from a GET /workflow/{id} response:


{
    ...
    "jobPayloadSchema": {
        "workflow_input_we4tej0ly": {
            "id": "we4tej0ly",
            "variable_name": "workflow_input_we4tej0ly",
            "display_name": "TextInput",
            "type": "str",
            "is_nullable": false,
            ...
        },
        "workflow_input_a0hk6ujuo": {
            "id": "a0hk6ujuo",
            "variable_name": "workflow_input_a0hk6ujuo",
            "display_name": "NumberInput",
            "type": "float",
            "is_nullable": false,
            ...
        },
        "workflow_input_h69vx5i4a": {
            "id": "h69vx5i4a",
            "variable_name": "workflow_input_h69vx5i4a",
            "display_name": "FileInput(Single)",
            "type": "file",
            "is_nullable": false,
            "tags": [
                {
                    "variable_name": "allowed_file_types",
                    "value": [ "JPEG", "PNG", "JPG", "PDF", ... ],
                }
            ],
            ...
        },
        "workflow_input_m2z6rkzgj": {
            "id": "m2z6rkzgj",
            "variable_name": "workflow_input_m2z6rkzgj",
            "display_name": "BoolInput",
            "type": "bool",
            "is_nullable": false,
            ...
        },
        "workflow_input_2kbsjrx1y": {
            "id": "2kbsjrx1y",
            "variable_name": "workflow_input_2kbsjrx1y",
            "display_name": "ListInput",
            "type": "array",
            "is_nullable": false,
            ...
        },
        "workflow_input_bzti690ga": {
            "id": "bzti690ga",
            "variable_name": "workflow_input_bzti690ga",
            "display_name": "ObjectInput",
            "type": "object",
            "is_nullable": false,
            ...
        },
        "workflow_input_k3ayfjyh7": {
            "id": "k3ayfjyh7",
            "variable_name": "workflow_input_k3ayfjyh7",
            "display_name": "DateInput",
            "type": "date",
            "is_nullable": false,
            ...
        },
        "workflow_input_auqgnzk8d": {
            "id": "auqgnzk8d",
            "variable_name": "workflow_input_auqgnzk8d",
            "display_name": "FileInput(Multiple)",
            "type": "array_files",
            "is_nullable": false,
            "tags": [
                {
                    "variable_name": "allowed_file_types",
                    "value": [ "JPEG", "PNG", "JPG", "PDF", ... ],
                }
            ],
            ...
        }
    }
}


Initiate Job
POST /job/initiate (Given workflow initiates a job)



This step creates a job instance in the system and returns the unique ID jobExecutionId required for execution and monitoring.



Parameters

workflowId *required string

ID of the workflow to be used for your job


title *required string

your chosen job title


description *required string

your chosen job description


Headers

x-service-key: <your_service_key>


Request Body

Media Type : application/json



Example Value

{
  "workflowId": "your_workflow_id_here",
  "title": "your_chosen_job_title_here",
  "description": "your_chosen_job_description_here"
}




Schema :

{
	workflowId*: string, //	The ID of the workflow to execute
	title*:	string, // Job title
	description*: string, // Job description
}





Responses

Code : 201

Media Type : application/json *Controls Accept header



Example Value

{
  "jobExecutionId": "string"
}



Schema :

{
	jobExecutionId*: string, // Job execution ID
}



You must save this jobExecutionId for all subsequent steps.

Uploading Files for Job Inputs
This step is only required if your workflow schema contains inputs of type File (single) (file) or File (Multiple) (array_files).



You must perform this step for each file you intend to upload.





Generate Presigned File Upload URL

POST /job/file/upload



Headers:

x-service-key: <your_service_key>


This is used to request a secure, temporary URL for uploading your file. This returns two URLs.



{
  "fileExtension": ".pdf",
  "accessScope": "organization"
}




Note on fileExtension: The extension provided should match the file you intend to upload. Opus supports files of type:
jpeg
.png
.jpg
.pdf
.docx
.csv
.xls
.xlsx
.txt
.json
.html
.xml

Note on accessScope: This field must be one of the following string values: all, user, workspace, or organization.


Response:



{
  "presignedUrl": "https://appliedai-opus-x1.s3.eu-central-1.amazonaws.com/media/private/uploaded/media_f8c8fc47....",
  
  "fileUrl":"https://files.opus.com/media/private/uploaded/media_3ca210fc-eea1-4e2c-936e-29d068878f34.pdf"
}




presignedUrl: Use this URL to upload the file in the next step.

fileUrl: Save this URL. This is used to reference the file in the Job execution request.


Uploading files

Method: PUT

Endpoint: {presignedUrl} (Use the presignedUrl from the above step)

Purpose: To upload the file's binary content.

Headers: No authentication headers (e.g., x-service-key) are required for this PUT request.

Body: The raw binary data of the file.

Execute Job
POST /job/execute

Parameters

jobExecutionId *required string

ID of the job to executed

jobPayloadSchemaInstance *required object

jobPayloadSchema from the Initiate Job response with value for each input populated.


Example Request:

{
    "jobExecutionId": "2514",
    "jobPayloadSchemaInstance": {
        "workflow_input_we4tej0ly": {
            "value": "API Test Project",
            "type": "str"
        },
        "workflow_input_a0hk6ujuo": {
            "value": 45.8,
            "type": "float"
        },
        "workflow_input_h69vx5i4a": {
            "value": "https://files.opus.com/media/private/uploaded/media_file_001.pdf",
            "type": "file"
        },
        "workflow_input_m2z6rkzgj": {
            "value": true,
            "type": "bool"
        },
        "workflow_input_2kbsjrx1y": {
            "value": [
                "User1",
                "User2",
                "User3"
            ],
            "type": "array"
        },
        "workflow_input_bzti690ga": {
            "value": {
                "client_id": "C-456",
                "is_priority": true
            },
            "type": "object"
        },
        "workflow_input_k3ayfjyh7": {
            "value": "2025-11-09",
            "type": "date"
        },
        "workflow_input_auqgnzk8d": {
            "value": [
                "https://files.opus.com/media/private/uploaded/media_report.docx",
                "https://files.opus.com/media/private/uploaded/media_image.png"
            ],
            "type": "array_files"
        }
    }
}



Schema:

{
	jobExecutionId*: string, // The ID of the job execution

	jobPayloadSchemaInstance*:	{
		// description:Job payload schema instantiated by the client
	},
}



Responses

Code: 201

Media Type: application/json *Controls Accept header



Example Value

{
  "success": true,
  "message": "Job execution has been started",
  "jobExecutionId": "2514",
  "jobPayloadSchemaInstance": {
    "workflow_input_we4tej0ly": "API Test Project",
    "workflow_input_a0hk6ujuo": 45.8,
    "workflow_input_h69vx5i4a": "https://files.opus.com/media/private/uploaded/media_file_001.pdf",
    "workflow_input_m2z6rkzgj": true,
    "workflow_input_2kbsjrx1y": [
      "User1",
      "User2",
      "User3"
    ],
    "workflow_input_bzti690ga": {
      "client_id": "C-456",
      "is_priority": true
    },
    "workflow_input_k3ayfjyh7": "2025-11-09",
    "workflow_input_auqgnzk8d": [
      "https://files.opus.com/media/private/uploaded/media_report.docx",
      "https://files.opus.com/media/private/uploaded/media_image.png"
    ]
  }
}




Schema:

{
	success*: boolean, // Success status
	message*: string, // Message
	jobExecutionId*: string, // Job execution ID
	jobPayloadSchemaInstance: {
	}
}

Get Job Execution Status
GET /job/ {jobExecutionId} /status



After executing the job, you can use the jobExecutionId to check its status (e.g., IN PROGRESS, COMPLETED, FAILED).



Parameters

jobExecutionId *required string

ID of the job whose execution status you want to check


Headers:

x-service-key: <your_service_key>


Responses

Code : 200

Media Type : application/json *Controls Accept header



Example Response:

{
  "status": "IN PROGRESS"
}



Schema:

{
	status*: string, // tatus message of the job
}



Get Job Execution Results
GET /job/ {jobExecutionId} /results



After executing the job, you can use the jobExecutionId to check its status (e.g., IN PROGRESS, COMPLETED, FAILED).



Once the status of the job is COMPLETED, you can use the results endpoint to view the results of the job.



Parameters

jobExecutionId *required string

ID of the job whose execution status you want to check


Headers:

x-service-key: <your_service_key>


Responses

Code : 200

Media Type : application/json *Controls Accept header



Example Response

{
  "jobExecutionId": "2514",
  "status": "COMPLETED",
  "results": {
    "summary": "Job executed successfully.",
    "outputFiles": [
 "https://files.opus.com/media/private/generated/output_9a1b23.pdf"
    ],
    "data": {
      "score": 92,
      "verdict": "PASS",
      "comments": "All documents validated successfully."
    }
  }
}




Schema :

{
	jobResultsPayloadSchema*: {
		//description: Workflow output schema

		< * >:	WorkflowOutputVariableDto,
	},
}

Job Audit Log
GET /job/ {jobExecutionId} /audit



Opus allows you to retrieve a detailed, timestamped log of all system actions taken during the job's execution.

Parameters

jobExecutionId *required string

ID of the job to executed


Responses

Code : 200

Media Type : application/json *Controls Accept header



Example Response

{
  "jobExecutionId": "2514",
  "auditTrail": [
    {
      "timestamp": "2025-10-27T12:32:00Z",
      "actor": "SYSTEM",
      "action": "Job initiated"
    },
    {
      "timestamp": "2025-10-27T12:33:15Z",
      "actor": "SYSTEM",
      "action": "File validated and processed"
    },
    {
      "timestamp": "2025-10-27T12:34:10Z",
      "actor": "SYSTEM",
      "action": "Job completed successfully"
    }
  ]
}




Schema:

{
  jobExecutionId,
  auditTrail: [
    {
      timestamp,
      actor,
			action
    },
    {
      timestamp,
      actor,
			action
    },
    ...
  ]
}

