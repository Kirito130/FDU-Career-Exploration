/**
 * New Competency Service - Simplified Structure
 * Works with the new 3-table database design
 */

import { supabase } from '../database/supabase.js';

/**
 * Get job roles that match the selected competency combination
 * @param {Array<string>} competencies - Array of 3 selected competencies
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} Array of matching job roles with match scores
 */
export async function getJobsByCompetencies(competencies, limit = null) {
  try {
    // Sort competencies to ensure consistent combination key
    const sortedCompetencies = [...competencies].sort();
    
    // Query jobs that have these competencies in their top 3
    let query = supabase
      .from('job_nace_mappings')
      .select(`
        *,
        occupation_data(onetsoc_code, title, description)
      `)
      .or(`competency_1.in.(${sortedCompetencies.join(',')}),competency_2.in.(${sortedCompetencies.join(',')}),competency_3.in.(${sortedCompetencies.join(',')})`)
      .order('competency_1_score', { ascending: false });
    
    // Only apply limit if specified
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching jobs by competencies:', error.message);
      return [];
    }
    
    // Calculate match scores based on competency positions
    return data.map(item => {
      let matchScore = 0;
      const jobCompetencies = [item.competency_1, item.competency_2, item.competency_3];
      let totalWeight = 0;
      
      // Calculate weighted score based on competency positions
      sortedCompetencies.forEach(comp => {
        const index = jobCompetencies.indexOf(comp);
        if (index !== -1) {
          // Higher score for competencies in higher positions
          const weight = 3 - index; // 3 for first, 2 for second, 1 for third
          const score = index === 0 ? item.competency_1_score : 
                       index === 1 ? item.competency_2_score : 
                       item.competency_3_score;
          matchScore += score * weight;
          totalWeight += weight;
        }
      });
      
      // Calculate percentage (0-100)
      const percentage = totalWeight > 0 ? (matchScore / totalWeight) : 0;
      
      return {
        onetsoc_code: item.onetsoc_code,
        title: item.occupation_data?.title || 'Unknown Title',
        description: item.occupation_data?.description || 'No description available',
        match_score: Math.round(Math.min(percentage, 100)) // Cap at 100%
      };
    });
    
  } catch (error) {
    console.error('Error in getJobsByCompetencies:', error.message);
    return [];
  }
}

/**
 * Get detailed job information including top matching competencies
 * @param {string} onetsocCode - ONET SOC code for the job
 * @returns {Promise<Object|null>} Detailed job information or null if not found
 */
export async function getDetailedJobInfo(onetsocCode) {
  try {
    // Get basic occupation data
    const { data: occupationData, error: occupationError } = await supabase
      .from('occupation_data')
      .select('*')
      .eq('onetsoc_code', onetsocCode)
      .single();
    
    if (occupationError) {
      console.error('Error fetching occupation data:', occupationError.message);
      return null;
    }
    
    // Get job zone information
    const { data: jobZoneData } = await supabase
      .from('job_zones')
      .select(`
        *,
        job_zone_reference(name, experience, education, job_training, examples, svp_range)
      `)
      .eq('onetsoc_code', onetsocCode)
      .single();
    
    // Get NACE competency mappings
    const { data: naceMapping } = await supabase
      .from('job_nace_mappings')
      .select('*')
      .eq('onetsoc_code', onetsocCode)
      .single();
    
    // Get all competency scores for this job
    const { data: competencyScores } = await supabase
      .from('job_competency_scores')
      .select('*')
      .eq('onetsoc_code', onetsocCode)
      .order('score', { ascending: false });
    
    // Get top skills
    const { data: skillsData } = await supabase
      .from('skills')
      .select(`
        *,
        content_model_reference(element_name, description)
      `)
      .eq('onetsoc_code', onetsocCode)
      .order('data_value', { ascending: false })
      .limit(10);
    
    // Get top knowledge areas
    const { data: knowledgeData } = await supabase
      .from('knowledge')
      .select(`
        *,
        content_model_reference(element_name, description)
      `)
      .eq('onetsoc_code', onetsocCode)
      .order('data_value', { ascending: false })
      .limit(10);
    
    // Get work activities
    const { data: workActivitiesData } = await supabase
      .from('work_activities')
      .select(`
        *,
        content_model_reference(element_name, description)
      `)
      .eq('onetsoc_code', onetsocCode)
      .order('data_value', { ascending: false })
      .limit(10);
    
    // Get education and training requirements
    const { data: educationData } = await supabase
      .from('education_training_experience')
      .select(`
        *,
        content_model_reference(element_name, description),
        ete_categories(category_description)
      `)
      .eq('onetsoc_code', onetsocCode)
      .order('data_value', { ascending: false })
      .limit(10);
    
    // Format top competencies
    const topCompetencies = [];
    if (naceMapping) {
      topCompetencies.push(
        { competency_name: naceMapping.competency_1, match_strength: naceMapping.competency_1_score },
        { competency_name: naceMapping.competency_2, match_strength: naceMapping.competency_2_score },
        { competency_name: naceMapping.competency_3, match_strength: naceMapping.competency_3_score }
      );
    }
    
    return {
      onetsoc_code: occupationData.onetsoc_code,
      title: occupationData.title,
      description: occupationData.description,
      job_zone: jobZoneData?.job_zone_reference || null,
      top_competencies: topCompetencies,
      skills: skillsData || [],
      knowledge: knowledgeData || [],
      work_activities: workActivitiesData || [],
      education_training: educationData || [],
      all_competency_scores: competencyScores || []
    };
    
  } catch (error) {
    console.error('Error in getDetailedJobInfo:', error.message);
    return null;
  }
}

/**
 * Get all available NACE competencies
 * @returns {Promise<Array>} Array of NACE competencies
 */
export async function getAllCompetencies() {
  return [
    'Communication',
    'Critical Thinking', 
    'Leadership',
    'Teamwork',
    'Technology',
    'Professionalism',
    'Career & Self-Development',
    'Equity & Inclusion'
  ];
}

/**
 * Check if competency mappings exist in the database
 * @returns {Promise<boolean>} True if mappings exist, false otherwise
 */
export async function checkCompetencyMappingsExist() {
  try {
    const { count, error } = await supabase
      .from('job_nace_mappings')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking competency mappings:', error.message);
      return false;
    }
    
    return count > 0;
  } catch (error) {
    console.error('Error in checkCompetencyMappingsExist:', error.message);
    return false;
  }
}

/**
 * Get statistics about competency mappings
 * @returns {Promise<Object>} Statistics object
 */
export async function getCompetencyMappingStats() {
  try {
    const { count: totalMappings, error: mappingsError } = await supabase
      .from('job_nace_mappings')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalJobs, error: jobsError } = await supabase
      .from('occupation_data')
      .select('*', { count: 'exact', head: true });
    
    if (mappingsError || jobsError) {
      console.error('Error fetching mapping stats:', mappingsError || jobsError);
      return null;
    }
    
    return {
      totalMappings: totalMappings || 0,
      totalJobs: totalJobs || 0,
      coveragePercentage: totalJobs > 0 ? Math.round((totalMappings / totalJobs) * 100) : 0
    };
  } catch (error) {
    console.error('Error in getCompetencyMappingStats:', error.message);
    return null;
  }
}

export default {
  getJobsByCompetencies,
  getDetailedJobInfo,
  getAllCompetencies,
  checkCompetencyMappingsExist,
  getCompetencyMappingStats
};
