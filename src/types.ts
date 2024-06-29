export interface Member {
    id: number;
    name: string;
    username: string;
    avatar: string;
    is_active: boolean;
    role: string;
    email: string;
    teams: string[];
}

export interface MemberInput {
    name: string;
    username: string;
    avatar: string;
    is_active: boolean;
    role: string;
    email: string;
    teams: string[];
}


