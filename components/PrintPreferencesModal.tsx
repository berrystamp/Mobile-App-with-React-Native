/**
 * PrintPreferencesModal
 *
 * A bottom-sheet modal that collects print preferences before the customer
 * proceeds to printer selection. Used from both the Product Detail screen and
 * the Cart screen.
 *
 * Collects:
 *  - Budget (estimatedAmount)
 *  - Delivery Date (date picker, min = today)
 *  - Delivery Address (MapTiler autocomplete → GeocodedAddress)
 *  - Own-item toggle ("Yes" / "No")
 *  - Pickup Address (only when hasOwnItem = true, also autocomplete)
 *
 * On "Continue" (all fields valid) it calls `onContinue` with the collected
 * data so the parent can navigate to the Select Printer screen.
 */

import { Feather, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
    useWindowDimensions,
} from 'react-native';

import { debounce, geocodeQuery, type GeocodedAddress } from '@/lib/geocoding';
import { savePrintPreferences } from '@/lib/printPreferences';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrintPreferencesResult {
    estimatedAmount: string;
    dateOfDelivery: string;
    deliveryAddress: GeocodedAddress;
    hasOwnItem: boolean;
    pickupAddress?: GeocodedAddress;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    /** Called after validation passes and preferences are persisted. */
    onContinue: (result: PrintPreferencesResult) => void;
}

type PrefErrors = {
    estimatedAmount?: string;
    deliveryDate?: string;
    deliveryAddress?: string;
    hasOwnItem?: string;
    pickupAddress?: string;
};

// ─── Address Autocomplete Sub-component ──────────────────────────────────────

interface AddressFieldProps {
    label: string;
    placeholder?: string;
    error?: string;
    isDark: boolean;
    onSelect: (address: GeocodedAddress) => void;
    onClear: () => void;
}

function AddressAutocompleteField({
    label,
    placeholder = 'Start typing an address…',
    error,
    isDark,
    onSelect,
    onClear,
}: AddressFieldProps) {
    const [text, setText] = useState('');
    const [suggestions, setSuggestions] = useState<GeocodedAddress[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<GeocodedAddress | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // Debounced search – created once via ref so it survives re-renders.
    const debouncedSearch = useRef(
        debounce(async (query: string) => {
            if (query.trim().length < 3) {
                setSuggestions([]);
                setShowDropdown(false);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const results = await geocodeQuery(query);
                setSuggestions(results);
                setShowDropdown(results.length > 0 || query.trim().length >= 3);
            } catch {
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 400),
    ).current;

    const handleChangeText = useCallback(
        (value: string) => {
            setText(value);
            // Invalidate the previously selected geocoded address whenever text changes.
            if (selectedAddress) {
                setSelectedAddress(null);
                onClear();
            }
            debouncedSearch(value);
        },
        [debouncedSearch, onClear, selectedAddress],
    );

    const handleSelect = useCallback(
        (addr: GeocodedAddress) => {
            setSelectedAddress(addr);
            setText(addr.name);
            setSuggestions([]);
            setShowDropdown(false);
            onSelect(addr);
        },
        [onSelect],
    );

    const borderColor = error
        ? '#EB5757'
        : isDark
            ? '#5E4CBA'
            : '#3B2D85';

    return (
        <View className="mb-4">
            {/* Floating label */}
            <Text
                style={{ zIndex: 1 }}
                className="absolute left-3 top-[-8px] bg-white px-1 text-xs text-[#333333] dark:bg-[#1E1E1E] dark:text-white"
            >
                {label}
            </Text>

            <View
                style={{ borderColor, borderWidth: 1 }}
                className="flex-row items-center rounded-xl px-4 py-3.5"
            >
                <Ionicons name="location-outline" size={20} color={isDark ? '#A0A0A0' : '#828282'} />
                <TextInput
                    value={text}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#BDBDBD"
                    className="ml-3 flex-1 text-[#333] dark:text-white"
                    autoCorrect={false}
                    autoCapitalize="none"
                />
                {loading && <ActivityIndicator size="small" color="#3B2D85" />}
                {!loading && !!text && (
                    <TouchableOpacity
                        onPress={() => {
                            setText('');
                            setSuggestions([]);
                            setShowDropdown(false);
                            setSelectedAddress(null);
                            onClear();
                        }}
                    >
                        <Ionicons name="close-circle" size={18} color="#8E8E93" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Dropdown */}
            {showDropdown && (
                <View
                    style={{ zIndex: 999 }}
                    className="absolute left-0 right-0 top-14 rounded-xl border border-[#E5E5EA] bg-white shadow-lg dark:border-[#2C2C2E] dark:bg-[#1E1E1E]"
                >
                    {suggestions.length === 0 ? (
                        <View className="px-4 py-3">
                            <Text className="text-[13px] text-[#8E8E93]">No matching address found</Text>
                        </View>
                    ) : (
                        suggestions.slice(0, 5).map((addr, idx) => (
                            <TouchableOpacity
                                key={`${addr.latitude}-${addr.longitude}-${idx}`}
                                onPress={() => handleSelect(addr)}
                                className={`px-4 py-3 ${idx < suggestions.slice(0, 5).length - 1 ? 'border-b border-[#F5F5F7] dark:border-[#2C2C2E]' : ''}`}
                            >
                                <Text
                                    numberOfLines={2}
                                    className="text-[13px] text-[#1C1C1E] dark:text-white"
                                >
                                    {addr.name}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            )}

            {!!error && (
                <Text className="mt-1 text-xs font-medium text-[#EB5757]">{error}</Text>
            )}
        </View>
    );
}

// ─── Helper Sub-components ────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View className="mb-4">
            <Text className="absolute left-3 top-[-8px] z-10 bg-white px-1 text-xs text-[#333333] dark:bg-[#1E1E1E] dark:text-white">
                {label}
            </Text>
            {children}
        </View>
    );
}

function ChoiceRow({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={onPress} className="mb-4 flex-row items-start gap-x-3">
            <View
                className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-[#3B2D85]' : 'border-gray-300'
                    }`}
            >
                {selected ? <View className="h-2.5 w-2.5 rounded-full bg-[#3B2D85]" /> : null}
            </View>
            <Text className="flex-1 text-sm leading-5 text-[#828282] dark:text-gray-300">{label}</Text>
        </TouchableOpacity>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function PrintPreferencesModal({ visible, onClose, onContinue }: Props) {
    const isDark = useColorScheme() === 'dark';
    const { height: screenHeight } = useWindowDimensions();

    // Form state
    const [estimatedAmount, setEstimatedAmount] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState<GeocodedAddress | null>(null);
    const [pickupLocation, setPickupLocation] = useState<GeocodedAddress | null>(null);
    const [hasOwnItem, setHasOwnItem] = useState<boolean | null>(null);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState<PrefErrors>({});

    // Delivery and pickup address field keys – incrementing forces re-mount (clears field)
    const [deliveryKey, setDeliveryKey] = useState(0);
    const [pickupKey, setPickupKey] = useState(0);

    // Reset form whenever the modal opens
    useEffect(() => {
        if (visible) {
            setEstimatedAmount('');
            setDeliveryDate('');
            setDeliveryLocation(null);
            setPickupLocation(null);
            setHasOwnItem(null);
            setDate(new Date());
            setShowDatePicker(false);
            setErrors({});
            setDeliveryKey((k) => k + 1);
            setPickupKey((k) => k + 1);
        }
    }, [visible]);

    const onChangeDate = (_event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDate(selectedDate);
            setDeliveryDate(selectedDate.toISOString().split('T')[0]);
            setErrors((e) => ({ ...e, deliveryDate: undefined }));
        }
        setShowDatePicker(false);
    };

    const validate = (): boolean => {
        const next: PrefErrors = {};

        if (!estimatedAmount.trim()) {
            next.estimatedAmount = 'Budget is required';
        }

        if (!deliveryDate.trim()) {
            next.deliveryDate = 'Delivery date is required';
        }

        if (!deliveryLocation) {
            next.deliveryAddress = 'Please select an address from the suggestions';
        }

        if (hasOwnItem === null) {
            next.hasOwnItem = 'Please select an option';
        }

        if (hasOwnItem === true && !pickupLocation) {
            next.pickupAddress = 'Please select a pickup address from the suggestions';
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleContinue = async () => {
        if (!validate()) return;

        await savePrintPreferences({
            estimatedAmount,
            deliveryDate,
            deliveryAddress: deliveryLocation!.name,
            pickupAddress: pickupLocation?.name ?? '',
            hasOwnItem: hasOwnItem ?? false,
        });

        onContinue({
            estimatedAmount,
            dateOfDelivery: deliveryDate,
            deliveryAddress: deliveryLocation!,
            hasOwnItem: hasOwnItem ?? false,
            pickupAddress: pickupLocation ?? undefined,
        });
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
                >
                    <View
                        style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}
                        className="w-full items-center rounded-t-[32px] bg-white px-6 pt-6 dark:bg-[#1E1E1E]"
                    >
                        {/* Header */}
                        <View className="relative mb-8 w-full flex-row items-center justify-center">
                            <Text className="mx-auto text-lg font-semibold text-[#333333] dark:text-white">
                                Printing Preferences
                            </Text>
                            <TouchableOpacity onPress={onClose} className="absolute right-0">
                                <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#333'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={{ maxHeight: screenHeight * 0.72 }}
                            className="w-full"
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Budget */}
                            <Field label="Budget (Estimated Amount)">
                                <View
                                    style={{
                                        borderColor: errors.estimatedAmount ? '#EB5757' : isDark ? '#5E4CBA' : '#3B2D85',
                                        borderWidth: 1,
                                    }}
                                    className="flex-row items-center rounded-xl px-4 py-3.5"
                                >
                                    <Ionicons name="pricetags-outline" size={20} color={isDark ? '#A0A0A0' : '#828282'} />
                                    <TextInput
                                        value={estimatedAmount}
                                        onChangeText={(v) => {
                                            setEstimatedAmount(v);
                                            setErrors((e) => ({ ...e, estimatedAmount: undefined }));
                                        }}
                                        placeholder="e.g., 5000"
                                        placeholderTextColor="#BDBDBD"
                                        keyboardType="numeric"
                                        className="ml-3 flex-1 text-[#333] dark:text-white"
                                    />
                                </View>
                                {!!errors.estimatedAmount && (
                                    <Text className="mt-1 text-xs font-medium text-[#EB5757]">
                                        {errors.estimatedAmount}
                                    </Text>
                                )}
                            </Field>

                            {/* Delivery Date */}
                            <Field label="Delivery Date">
                                <View
                                    style={{
                                        borderColor: errors.deliveryDate ? '#EB5757' : isDark ? '#5E4CBA' : '#3B2D85',
                                        borderWidth: 1,
                                    }}
                                    className="flex-row items-center justify-between rounded-xl px-4 py-3.5"
                                >
                                    <TouchableOpacity
                                        onPress={() => setShowDatePicker(true)}
                                        className="flex-1 flex-row items-center"
                                    >
                                        <Ionicons name="calendar-outline" size={20} color={isDark ? '#A0A0A0' : '#828282'} />
                                        <Text className="ml-3 text-[#333] dark:text-white">
                                            {deliveryDate || 'Select date'}
                                        </Text>
                                    </TouchableOpacity>
                                    <Feather name="chevron-right" size={20} color={isDark ? '#A0A0A0' : '#828282'} />
                                </View>
                                {!!errors.deliveryDate && (
                                    <Text className="mt-1 text-xs font-medium text-[#EB5757]">
                                        {errors.deliveryDate}
                                    </Text>
                                )}
                            </Field>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                    onChange={onChangeDate}
                                    minimumDate={new Date()}
                                />
                            )}

                            {/* Delivery Address */}
                            <AddressAutocompleteField
                                key={`delivery-${deliveryKey}`}
                                label="Delivery Address"
                                placeholder="Type your delivery address…"
                                error={errors.deliveryAddress}
                                isDark={isDark}
                                onSelect={(addr) => {
                                    setDeliveryLocation(addr);
                                    setErrors((e) => ({ ...e, deliveryAddress: undefined }));
                                }}
                                onClear={() => {
                                    setDeliveryLocation(null);
                                }}
                            />

                            {/* Own-item toggle */}
                            <Text className="mb-4 text-base font-bold text-[#333333] dark:text-white">
                                Do you have your own item?
                            </Text>
                            <ChoiceRow
                                label="Yes, I have my items and I would like a pickup and delivery service"
                                selected={hasOwnItem === true}
                                onPress={() => {
                                    setHasOwnItem(true);
                                    setErrors((e) => ({ ...e, hasOwnItem: undefined }));
                                }}
                            />
                            <ChoiceRow
                                label="No, get item from the printer's inventory with delivery service"
                                selected={hasOwnItem === false}
                                onPress={() => {
                                    setHasOwnItem(false);
                                    setPickupLocation(null);
                                    setPickupKey((k) => k + 1);
                                    setErrors((e) => ({ ...e, hasOwnItem: undefined, pickupAddress: undefined }));
                                }}
                            />
                            {!!errors.hasOwnItem && (
                                <Text className="mb-2 mt-[-8px] text-xs font-medium text-[#EB5757]">
                                    {errors.hasOwnItem}
                                </Text>
                            )}

                            {/* Pickup Address – only when hasOwnItem === true */}
                            {hasOwnItem === true && (
                                <AddressAutocompleteField
                                    key={`pickup-${pickupKey}`}
                                    label="Pickup Address"
                                    placeholder="Type your pickup address…"
                                    error={errors.pickupAddress}
                                    isDark={isDark}
                                    onSelect={(addr) => {
                                        setPickupLocation(addr);
                                        setErrors((e) => ({ ...e, pickupAddress: undefined }));
                                    }}
                                    onClear={() => {
                                        setPickupLocation(null);
                                    }}
                                />
                            )}

                            {/* Continue Button */}
                            <TouchableOpacity
                                onPress={handleContinue}
                                className="mb-8 mt-2 items-center justify-center rounded-full bg-[#3B2D85] py-4"
                            >
                                <Text className="text-base font-bold text-white">Continue</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
