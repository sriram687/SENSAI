export const dynamic = "force-dynamic";

import { getResume } from "../../../actions/resume";
import ResumeBuilder from "./_components/resume-builder";

export default async function ResumePage() {
  // Try to get the resume, but provide a default if it fails
  let resumeContent;
  try {
    const resume = await getResume();
    resumeContent = resume?.content;
  } catch (error) {
    console.error("Error fetching resume:", error);
    // Default resume content for testing
    resumeContent = `# John Doe
Software Engineer | johndoe@example.com | (123) 456-7890

## Summary
Experienced software engineer with a passion for building scalable web applications and solving complex problems.

## Skills
JavaScript, TypeScript, React, Node.js, Python, SQL, AWS, Docker

## Work Experience
### Senior Software Engineer | ABC Tech
*2020 - Present*

* Led the development of a customer-facing dashboard that increased user engagement by 40%
* Implemented CI/CD pipelines that reduced deployment time by 60%
* Mentored junior developers and conducted code reviews

### Software Engineer | XYZ Solutions
*2017 - 2020*

* Developed RESTful APIs using Node.js and Express
* Built responsive web applications using React and Redux
* Collaborated with cross-functional teams to deliver features on time

## Education
### Master of Computer Science | University of Technology
*2015 - 2017*

* GPA: 3.8/4.0
* Thesis: "Optimizing Database Performance in Distributed Systems"

### Bachelor of Science in Computer Science | State University
*2011 - 2015*

* GPA: 3.7/4.0
* Dean's List: All semesters`;
  }

  return (
    <div className="container mx-auto py-6">
      <ResumeBuilder initialContent={resumeContent} />
    </div>
  );
}
