import { User, Project, MatchResult } from '../types';

/**
 * Normalizes a string for fuzzy skill and keyword comparisons
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Deterministic teammate matching algorithm
 * Computes a weighted score (0-100) based on:
 * - Skills: 60%
 * - Interests: 15%
 * - Availability: 10%
 * - Department Compatibility: 5%
 * - Year Compatibility: 5%
 * - Project Category Preference: 5%
 */
export function calculateMatchScore(student: User, project: Project): MatchResult {
  const reqSkills = project.requiredSkills || [];
  const studentSkills = student.skills || [];
  const studentInterests = student.interests || [];
  const studentAvailability = student.availability || [];
  const preferredTypes = student.preferredProjectTypes || [];

  // 1. SKILLS CALCULATION (Weight: 60%)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  if (reqSkills.length === 0) {
    // If no required skills are defined, baseline skill compatibility is high
    matchedSkills.push(...studentSkills);
  } else {
    for (const req of reqSkills) {
      const normReq = normalize(req);
      const hasSkill = studentSkills.some(s => {
        const normS = normalize(s);
        return normS === normReq || normS.includes(normReq) || normReq.includes(normS);
      });

      if (hasSkill) {
        matchedSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    }
  }

  const rawSkillRatio = reqSkills.length > 0 ? (matchedSkills.length / reqSkills.length) : 0.8;
  const skillScore = Math.min(100, Math.round(rawSkillRatio * 100));

  // 2. INTERESTS CALCULATION (Weight: 15%)
  // Check if student interests align with project category or project description
  const sharedInterests: string[] = [];
  const normCategory = normalize(project.category);
  const normDesc = project.description.toLowerCase();

  for (const interest of studentInterests) {
    const normInt = normalize(interest);
    if (
      normInt === normCategory ||
      normCategory.includes(normInt) ||
      normInt.includes(normCategory) ||
      normDesc.includes(interest.toLowerCase())
    ) {
      sharedInterests.push(interest);
    }
  }

  let interestScore = 20; // baseline interest
  if (sharedInterests.length >= 2) {
    interestScore = 100;
  } else if (sharedInterests.length === 1) {
    interestScore = 75;
  } else if (studentInterests.length > 0) {
    interestScore = 40;
  }

  // 3. AVAILABILITY CALCULATION (Weight: 10%)
  // Assess student time commitment / schedule compatibility
  let availabilityScore = 30;
  let availabilityCompatibility = 'Moderate availability';

  if (studentAvailability.includes('Flexible') || studentAvailability.includes('Full-time')) {
    availabilityScore = 100;
    availabilityCompatibility = 'High availability (flexible schedule)';
  } else if (
    studentAvailability.includes('Weekday evenings') &&
    studentAvailability.includes('Weekends')
  ) {
    availabilityScore = 95;
    availabilityCompatibility = 'Great schedule fit (evenings & weekends)';
  } else if (studentAvailability.length >= 2) {
    availabilityScore = 80;
    availabilityCompatibility = `Available (${studentAvailability.join(', ')})`;
  } else if (studentAvailability.length === 1) {
    availabilityScore = 60;
    availabilityCompatibility = `Limited to ${studentAvailability[0]}`;
  } else {
    availabilityScore = 40;
    availabilityCompatibility = 'Availability not specified';
  }

  // 4. DEPARTMENT COMPATIBILITY (Weight: 5%)
  // Related departments share synergy in engineering & computing
  let departmentScore = 50;
  const projectDept = project.creatorDepartment || 'CSE';
  if (student.department === projectDept) {
    departmentScore = 100;
  } else {
    const techDepts = ['CSE', 'IT', 'AI', 'DS', 'ECE'];
    if (techDepts.includes(student.department) && techDepts.includes(projectDept)) {
      departmentScore = 85;
    } else {
      departmentScore = 65;
    }
  }

  // 5. YEAR COMPATIBILITY (Weight: 5%)
  let yearScore = 70;
  if (student.year === '2nd Year' || student.year === '3rd Year') {
    yearScore = 95; // prime project completion years
  } else if (student.year === '4th Year' || student.year === 'Postgrad') {
    yearScore = 90; // senior expertise
  } else {
    yearScore = 80;
  }

  // 6. PROJECT TYPE PREFERENCE (Weight: 5%)
  let projectPrefScore = 30;
  if (
    preferredTypes.some(pt => {
      const normPt = normalize(pt);
      return normPt === normCategory || normCategory.includes(normPt) || normPt.includes(normCategory);
    })
  ) {
    projectPrefScore = 100;
  } else if (preferredTypes.length === 0) {
    projectPrefScore = 50;
  }

  // WEIGHTED FORMULA
  // Skills = 60%, Interests = 15%, Availability = 10%, Department = 5%, Year = 5%, Project Preference = 5%
  const totalWeighted = 
    (skillScore * 0.60) +
    (interestScore * 0.15) +
    (availabilityScore * 0.10) +
    (departmentScore * 0.05) +
    (yearScore * 0.05) +
    (projectPrefScore * 0.05);

  const matchScore = Math.min(100, Math.max(0, Math.round(totalWeighted)));

  // Generate deterministic human-readable explanation
  let explanation = '';
  const totalReq = reqSkills.length;
  const matchedCount = matchedSkills.length;

  if (totalReq > 0) {
    if (matchedCount === totalReq) {
      explanation = `${student.name.split(' ')[0]} matches all ${totalReq} required skills (${matchedSkills.slice(0, 3).join(', ')})`;
    } else if (matchedCount > 0) {
      explanation = `${student.name.split(' ')[0]} matches ${matchedCount} of ${totalReq} required skills (${matchedSkills.slice(0, 3).join(', ')})`;
    } else {
      explanation = `${student.name.split(' ')[0]} brings strong foundational experience in ${studentSkills.slice(0, 2).join(' and ')}`;
    }
  } else {
    explanation = `${student.name.split(' ')[0]} brings relevant technical skills in ${studentSkills.slice(0, 3).join(', ')}`;
  }

  if (sharedInterests.length > 0) {
    explanation += ` and shares an interest in ${sharedInterests[0]}`;
  } else if (studentInterests.length > 0) {
    explanation += ` with passion for ${studentInterests[0]}`;
  }

  if (availabilityScore >= 80) {
    explanation += `, with strong schedule alignment.`;
  } else {
    explanation += `.`;
  }

  return {
    studentId: student.id,
    matchScore,
    matchedSkills,
    missingSkills,
    sharedInterests,
    availabilityCompatibility,
    explanation,
    breakdown: {
      skillScore,
      interestScore,
      availabilityScore,
      departmentScore,
      yearScore,
      projectPrefScore,
    },
  };
}
