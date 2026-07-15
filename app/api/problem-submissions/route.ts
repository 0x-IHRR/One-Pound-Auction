import { problemSubmissionInputSchema } from '@/features/problem-collector/schemas/problem-submission.schema';
import { createProblemSubmission } from '@/features/problem-collector/server/services/problem-submission.service';
import { fail, ok } from '@/shared/http';
import { readJsonBody } from '@/server/lib/read-json-body';

export async function POST(request: Request) {
    try {
        const json = await readJsonBody(request);
        const input = problemSubmissionInputSchema.parse(json);
        const submission = await createProblemSubmission(input);
        return ok(submission, 201);
    } catch (error) {
        return fail(error);
    }
}
