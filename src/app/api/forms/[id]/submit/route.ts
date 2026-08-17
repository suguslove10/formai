import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FormFieldType } from "@/lib/validations/form";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid submission data" }, { status: 400 });
    }

    // Fetch form and check published status
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.status !== "published") {
      return NextResponse.json({ error: "This form is currently not accepting submissions." }, { status: 403 });
    }

    const fields = (form.fieldsJson as unknown as FormFieldType[]) || [];
    const errors: Record<string, string> = {};
    const sanitizedData: Record<string, any> = {};

    // Validate each field
    for (const field of fields) {
      const value = body[field.id];

      // Check required
      if (field.required) {
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          errors[field.id] = `${field.label} is required`;
          continue;
        }
      }

      // If value is provided, validate by field type
      if (value !== undefined && value !== null && value !== "") {
        switch (field.type) {
          case "email": {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (typeof value !== "string" || !emailRegex.test(value)) {
              errors[field.id] = "Please enter a valid email address";
            } else {
              sanitizedData[field.id] = value.trim().toLowerCase();
            }
            break;
          }
          case "number": {
            const num = Number(value);
            if (isNaN(num)) {
              errors[field.id] = "Please enter a valid number";
            } else {
              sanitizedData[field.id] = num;
            }
            break;
          }
          case "rating": {
            const rating = Number(value);
            if (isNaN(rating) || rating < 1 || rating > 5) {
              errors[field.id] = "Rating must be between 1 and 5";
            } else {
              sanitizedData[field.id] = rating;
            }
            break;
          }
          case "select":
          case "radio": {
            if (field.options && field.options.length > 0) {
              if (!field.options.includes(String(value))) {
                errors[field.id] = "Please select a valid option from the list";
              } else {
                sanitizedData[field.id] = value;
              }
            } else {
              sanitizedData[field.id] = value;
            }
            break;
          }
          case "checkbox": {
            if (Array.isArray(value)) {
              sanitizedData[field.id] = value;
            } else if (typeof value === "boolean") {
              sanitizedData[field.id] = value;
            } else {
              sanitizedData[field.id] = [value];
            }
            break;
          }
          case "date": {
            const parsedDate = new Date(value);
            if (isNaN(parsedDate.getTime())) {
              errors[field.id] = "Please enter a valid date";
            } else {
              sanitizedData[field.id] = value;
            }
            break;
          }
          default:
            sanitizedData[field.id] = value;
            break;
        }
      } else {
        sanitizedData[field.id] = null;
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: errors,
        },
        { status: 422 }
      );
    }

    // Save submission response to PostgreSQL
    const responseRecord = await prisma.response.create({
      data: {
        formId: id,
        dataJson: sanitizedData,
      },
    });

    return NextResponse.json({
      success: true,
      responseId: responseRecord.id,
      message: "Form response submitted successfully",
    });
  } catch (error: any) {
    console.error("Error submitting form response:", error);
    return NextResponse.json({ error: "Failed to submit form response. Please try again." }, { status: 500 });
  }
}
