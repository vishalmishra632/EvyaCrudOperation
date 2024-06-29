import React, { useEffect, useState } from 'react';
import { fetchMembers, fetchMemberById, updateMember, deleteMembers, addMember } from '../services/api';
import Pagination from '../Common/Pagination';
import useDebounce from '../hooks/useDebounce';
import SortIcon from '../Common/SortIcon';
import ValidationMessage from '../Common/ValidationMessage';
import axios from 'axios';

interface TeamMember {
    id: number;
    name: string;
    username: string;
    avatar: string;
    is_active: boolean;
    role: string;
    email: string;
    teams: string[];
}

const TeamSettings: React.FC = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<null | TeamMember>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [allSelected, setAllSelected] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 800); // 800ms delay
    const [sortColumn, setSortColumn] = useState<keyof TeamMember>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
    const [availableTeams] = useState(['product', 'marketing', 'tech', 'design', 'rnd', 'qa']);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const USER_ROLES = [
        "Phoenix Baker",
        "Product Designer",
        "Product Manager",
        "Frontend Developer",
        "Data Scientist",
        "Marketing Manager",
        "UX Researcher"
    ];
    const [userRoles] = useState(USER_ROLES);



    useEffect(() => {
        fetchData();
    }, [currentPage, itemsPerPage, debouncedSearchTerm, sortColumn, sortOrder]);

    const fetchData = async () => {
        try {
            const response = await fetchMembers(currentPage, itemsPerPage, debouncedSearchTerm, sortColumn, sortOrder);
            setTeamMembers(response.items);
            setTotalMembers(response.total);
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
    };

    const handleTeamChange = (team: string) => {
        setCurrentUser(prev => {
            if (!prev) return null;
            const newTeams = prev.teams.includes(team)
                ? prev.teams.filter(t => t !== team)
                : [...prev.teams, team];
            return { ...prev, teams: newTeams };
        });
    };

    const handleSort = (column: keyof TeamMember) => {
        if (column === sortColumn) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortOrder('asc');
        }
    };

    const handleSelectMember = (index: number | 'all') => {
        if (index === 'all') {
            if (allSelected) {
                setSelectedMembers([]);
            } else {
                const allIndexes = teamMembers.map((_, i) => i);
                setSelectedMembers(allIndexes);
            }
            setAllSelected(!allSelected);
        } else {
            setSelectedMembers(prev =>
                prev.includes(index as number) ? prev.filter(i => i !== index) : [...prev, index as number]
            );
        }
    };

    const handleEditClick = async (memberId: number) => {
        try {
            const member = await fetchMemberById(memberId);
            setCurrentUser(member);
            setIsEditMode(true);
            setShowUserModal(true);
        } catch (error) {
            console.error('Error fetching member details:', error);
            // Optionally, show an error message to the user
        }
    };


    const handleDeleteSelected = () => {
        setIsLoading(true);
        setShowDeleteConfirm(true);
        setIsLoading(false);
    };

    const confirmDelete = async () => {
        setIsLoading(true);
        try {
            const memberIds = selectedMembers.map(index => teamMembers[index].id);
            await deleteMembers(memberIds);

            // Update state in a single batch
            setSelectedMembers([]);
            setSuccessMessage('Users successfully deleted!');
            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 2000);
            await fetchData();
            // Update total members and current page
            const newTotalMembers = totalMembers - selectedMembers.length;
            setTotalMembers(newTotalMembers);

            // Redirect to the first page
            setCurrentPage(1);

            // The useEffect hook will handle fetching the updated data
        } catch (error) {
            console.error("Failed to delete members", error);
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
        }
    };


    const getTeamStyle = (teamIndex: number) => {
        const colors = [
            'bg-purple-100 text-purple-700',
            'bg-indigo-100 text-indigo-700',
            'bg-green-100 text-green-700',
            'bg-blue-100 text-blue-700',
        ];
        // Use modulus operator to cycle through colors
        const colorIndex = teamIndex % colors.length;
        return colors[colorIndex];
    };


    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value;
        setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    };

    <select value={currentUser?.role || ''} onChange={handleRoleChange}>
        {userRoles.map(role => (
            <option key={role} value={role}>{role}</option>
        ))}
    </select>


const handleUserConfirm = async () => {
    setErrorMessage(null);
    if (!currentUser) {
        console.log('No current user, returning');
        return;
    }
    setIsLoading(true);
    try {
        const userToSave = {
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(currentUser.username)}`,
            is_active: currentUser.is_active,
            role: currentUser.role,
            email: currentUser.email,
            teams: currentUser.teams
        };
        console.log('User to save:', userToSave);

        if (isEditMode) {
            console.log('Updating existing user');
            const updatedMember = await updateMember(currentUser.id, userToSave);
            console.log('Updated member:', updatedMember);
            setTeamMembers(prevMembers =>
                prevMembers.map(member =>
                    member.id === currentUser.id ? { ...member, ...updatedMember } : member
                )
            );
        } else {
            console.log('Adding new user');
            const newMember = await addMember(userToSave);
            console.log('New member:', newMember);
            setTeamMembers(prevMembers => [...prevMembers, newMember]);
        }

        setShowUserModal(false);
        setSuccessMessage(isEditMode ? 'User updated successfully!' : 'User added successfully!');
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 2000);

        // Reset currentUser after successful operation
        setCurrentUser(null);
        setIsEditMode(false);

        // Refetch data to ensure everything is in sync
        await fetchData();
    } catch (error) {
        console.error('Error occurred:', error);
        if (axios.isAxiosError(error) && error.response) {
            setErrorMessage(error.response.data.error || 'An unexpected error occurred.');
        } else if (error instanceof Error) {
            setErrorMessage(error.message);
        } else {
            setErrorMessage('An unexpected error occurred.');
        }
    } finally {
        setIsLoading(false);
    }
};

    const handleCancel = () => {
        setErrorMessage(null);  // Clear the error message
        setShowUserModal(false);  // Close the modal
        setCurrentUser(null);  // Reset the current user
        setIsEditMode(false);  // Reset edit mode
    };

    const clearSearch = () => {
        setSearchTerm('');
    };



    const totalPages = Math.ceil(totalMembers / itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Team Settings</h1>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-sm font-medium text-gray-700">
                                Team members
                                <span className="text-sm text-purple-600 ml-2">{totalMembers} users</span>
                            </h2>
                            <div className="w-64"> 
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        className="border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm w-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            onClick={clearSearch}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 flex items-center"
                                onClick={() => {
                                    setIsEditMode(false);
                                    setCurrentUser({
                                        id: 0,
                                        name: '',
                                        username: '',
                                        avatar: '',
                                        is_active: false,
                                        role: '',
                                        email: '',
                                        teams: []
                                    });
                                    setShowUserModal(true);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                                Add Member
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedMembers.length === 0
                                        ? 'bg-purple-400 text-white cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                                onClick={handleDeleteSelected}
                                disabled={selectedMembers.length === 0}
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px] flex flex-col">
                    {teamMembers.length === 0 ? (
                        <div className="flex-grow flex items-center justify-center text-center text-gray-500">
                            No data
                        </div>
                    ) : (

                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="border-t border-b border-gray-200">
                                    <th className="pl-6 py-3 w-12">
                                        <div className="flex items-end h-full">
                                            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                checked={allSelected}
                                                onChange={() => handleSelectMember('all')}
                                            />
                                        </div>
                                    </th>
                                    <th
                                        className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-3 w-1/4 cursor-pointer"
                                        onClick={() => handleSort('name')}
                                    >
                                        <span className="flex items-center">


                                            Name
                                            <SortIcon<TeamMember> column="name" currentSort={sortColumn} currentOrder={sortOrder} />

                                        </span>
                                    </th>
                                    <th
                                        className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-3 w-24 cursor-pointer"
                                        onClick={() => handleSort('is_active')}
                                    >
                                        <span className="flex items-center">
                                            Status
                                            <SortIcon column="is_active" currentSort={sortColumn} currentOrder={sortOrder} />

                                        </span>
                                    </th>

                                    <th
                                        className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-3 w-1/6 cursor-pointer"
                                        onClick={() => handleSort('role')}
                                    >
                                        <span className="flex items-center">
                                            Role
                                            <SortIcon column="role" currentSort={sortColumn} currentOrder={sortOrder} />
                                            <svg className="inline-block ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </th>
                                    <th
                                        className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-3 w-1/4 cursor-pointer"
                                        onClick={() => handleSort('email')}
                                    >
                                        <span className="flex items-center">
                                            Email address
                                            <SortIcon column="email" currentSort={sortColumn} currentOrder={sortOrder} />
                                        </span>
                                    </th>

                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-3 w-1/6">
                                        Teams
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-3 w-24">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.map((member, index) => (
                                    <tr key={member.id} className={index !== teamMembers.length - 1 ? "border-b border-gray-200" : ""}>
                                        <td className="pl-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                checked={selectedMembers.includes(index)}
                                                onChange={() => handleSelectMember(index)}
                                            />
                                        </td>
                                        <td className="py-4 px-3">
                                            <div className="flex items-center">
                                                {member.avatar && (
                                                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full mr-3" />
                                                )}

                                                <div>
                                                    <div className="font-medium text-gray-900">{member.name}</div>
                                                    <div className="text-sm text-gray-500">{member.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-3">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {member.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-3 text-sm text-gray-500">{member.role}</td>
                                        <td className="py-4 px-3 text-sm text-gray-500">{member.email}</td>
                                        <td className="py-4 px-3">
                                            <div className="flex flex-wrap gap-1">
                                                {member.teams.slice(0, 4).map((team, teamIndex) => (
                                                    <span
                                                        key={teamIndex}
                                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getTeamStyle(teamIndex)}`}
                                                    >
                                                        {team}
                                                    </span>
                                                ))}
                                                {member.teams.length > 4 && (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                                        +{member.teams.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="py-4 px-3 text-right text-sm font-medium">
                                            <button
                                                className="text-gray-400 hover:text-gray-500 mr-2"
                                                title="Delete user"

                                                onClick={() => {
                                                    setSelectedMembers([index]);
                                                    setShowDeleteConfirm(true);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-500" title="Edit user" onClick={() => handleEditClick(member.id)}


                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    )}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
            {showUserModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            {isEditMode ? 'Edit User' : 'Add User'}
                        </h2>
                        {currentUser && currentUser.avatar && (
                            <div className="mb-4 flex justify-center">
                                <img
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                    className="w-20 h-20 rounded-full object-cover"
                                />
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={currentUser?.name || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={currentUser?.username || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, username: e.target.value } : null)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                                Role
                            </label>
                            <select
                                value={currentUser?.role || ''}
                                onChange={handleRoleChange}
                                name="role"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="">Select a role</option>
                                {USER_ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={currentUser?.email || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Teams</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {availableTeams.map(team => (
                                    <button
                                        key={team}
                                        type="button"
                                        onClick={() => handleTeamChange(team)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${currentUser?.teams.includes(team)
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {team}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={currentUser?.is_active || false}
                                    onChange={(e) => setCurrentUser(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                                    className="form-checkbox h-5 w-5 text-purple-600"
                                />
                                <span className="ml-2 text-sm text-gray-700">Active User</span>
                            </label>
                        </div>
                        <ValidationMessage error={errorMessage} />
                        <div className="flex items-center justify-end">
                            <button
                                className="mr-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                                onClick={handleUserConfirm}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessPopup && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{successMessage}</h3>
                        <button
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg"
                            onClick={() => setShowSuccessPopup(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h2>
                        <p className="text-gray-700 mb-4">Are you sure you want to delete the selected members?</p>
                        <div className="flex items-center justify-end">
                            <button
                                className="mr-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-lg"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}
        </div>
    );
};

export default TeamSettings;
