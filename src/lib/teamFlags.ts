// Team flag emoji mappings for T20 World Cup teams
export const teamFlags: { [key: string]: string } = {
    // Full names
    'India': '🇮🇳',
    'Pakistan': '🇵🇰',
    'Australia': '🇦🇺',
    'England': '🇬🇧',
    'South Africa': '🇿🇦',
    'New Zealand': '🇳🇿',
    'Bangladesh': '🇧🇩',
    'Sri Lanka': '🇱🇰',
    'Afghanistan': '🇦🇫',
    'West Indies': '🌴',
    'Ireland': '🇮🇪',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Netherlands': '🇳🇱',
    'Nepal': '🇳🇵',
    'Zimbabwe': '🇿🇼',
    'Namibia': '🇳🇦',
    'USA': '🇺🇸',
    'Uganda': '🇺🇬',
    'Canada': '🇨🇦',
    'Oman': '🇴🇲',
    'UAE': '🇦🇪',
    'Papua New Guinea': '🇵🇬',

    // Short codes (common abbreviations)
    'IND': '🇮🇳',
    'PAK': '🇵🇰',
    'AUS': '🇦🇺',
    'ENG': '🇬🇧',
    'SA': '🇿🇦',
    'NZ': '🇳🇿',
    'BAN': '🇧🇩',
    'SL': '🇱🇰',
    'AFG': '🇦🇫',
    'WI': '🌴',
    'IRE': '🇮🇪',
    'SCO': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'NED': '🇳🇱',
    'NEP': '🇳🇵',
    'ZIM': '🇿🇼',
    'NAM': '🇳🇦',
    'AU': '🇦🇺',
};

export function getTeamFlag(teamName: string): string {
    // Try exact match first
    if (teamFlags[teamName]) {
        return teamFlags[teamName];
    }

    // Try case-insensitive match
    const lowerTeam = teamName.toLowerCase();
    for (const [key, flag] of Object.entries(teamFlags)) {
        if (key.toLowerCase() === lowerTeam) {
            return flag;
        }
    }

    // Try partial match (for "Team A" style names that contain the country)
    for (const [key, flag] of Object.entries(teamFlags)) {
        if (teamName.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(teamName.toLowerCase())) {
            return flag;
        }
    }

    // Default cricket emoji
    return '🏏';
}
