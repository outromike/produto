
"use client";

import { useState } from 'react';
import { ConferenceEntry, StorageLocation } from '@/types';
import { LocationCell } from './location-cell';
import { AllocationModal } from './allocation-modal';

interface Rua08ClientProps {
    initialConferences: ConferenceEntry[];
    initialStorageData: StorageLocation[];
}

// Based on the image provided
const COLUMNS = [111, 109, 107, 105, 103, 101, 99, 97, 95, 93, 91, 89, 87, 85, 83, 81, 79, 77, 75, 73];
const LEVELS = [6, 5, 4, 3, 2, 1];

export function Rua08Client({ initialConferences, initialStorageData }: Rua08ClientProps) {
    const [storageData, setStorageData] = useState(initialStorageData);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCellClick = (locationId: string) => {
        setSelectedLocation(locationId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLocation(null);
    }

    const handleAllocationUpdate = (updatedLocation: StorageLocation) => {
        setStorageData(prevData => {
            const existingIndex = prevData.findIndex(l => l.id === updatedLocation.id);
            if (existingIndex > -1) {
                const newData = [...prevData];
                newData[existingIndex] = updatedLocation;
                return newData;
            }
            return [...prevData, updatedLocation];
        });
    }

    const getLocationData = (locationId: string) => {
        return storageData.find(l => l.id === locationId);
    }
    
    return (
        <>
            <div className="space-y-4">
                <h1 className="text-3xl font-headline font-bold">Gerenciamento de Alocação - Rua 08</h1>
                <div className="overflow-x-auto rounded-lg border">
                    <div className="grid grid-cols-[auto_repeat(20,minmax(0,1fr))]">
                        {/* Headers */}
                        <div className="sticky left-0 z-10 grid grid-rows-7 bg-card">
                            <div className="flex h-12 items-center justify-center border-b border-r px-2 font-bold">Nível</div>
                            {LEVELS.map(level => (
                                <div key={`level-header-${level}`} className="flex h-20 items-center justify-center border-b border-r px-2 font-bold">
                                    {level}
                                </div>
                            ))}
                             <div className="flex h-12 items-center justify-center border-r px-2 font-bold"></div>
                        </div>

                        {/* Rua 08 Label & Grid Content */}
                        <div className="col-span-20 grid grid-cols-20">
                             <div className="col-span-20 grid grid-cols-20 border-b">
                                {COLUMNS.map(col => (
                                    <div key={`col-header-${col}`} className="flex h-12 items-center justify-center border-r font-bold bg-card">
                                        {col}
                                    </div>
                                ))}
                            </div>
                            <div className="col-span-20 grid grid-cols-20">
                                {LEVELS.map(level => (
                                    COLUMNS.map(col => {
                                        const locationId = `${col}-${level}`;
                                        const locationData = getLocationData(locationId);
                                        return (
                                            <LocationCell 
                                                key={locationId}
                                                locationId={locationId}
                                                data={locationData}
                                                onClick={() => handleCellClick(locationId)}
                                            />
                                        )
                                    })
                                ))}
                            </div>
                            <div className="col-span-20 grid grid-cols-20 border-t">
                                {COLUMNS.map(col => (
                                    <div key={`col-footer-${col}`} className="flex h-12 items-center justify-center border-r font-bold bg-card">
                                        {col}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedLocation && (
                <AllocationModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    locationId={selectedLocation}
                    locationData={getLocationData(selectedLocation)}
                    allConferences={initialConferences}
                    onAllocationUpdate={handleAllocationUpdate}
                />
            )}
        </>
    );
}

