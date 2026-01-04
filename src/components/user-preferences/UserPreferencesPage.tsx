import {
  CalendarDotsIcon,
  GearSixIcon,
  HandWavingIcon,
} from "@phosphor-icons/react";
import { useAuth } from "../../auth/useAuth";
import {
  UserPreference,
  useUserPreference,
} from "../../state/user-preference/useUserPreference";
import { useEffect, useImperativeHandle, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import classNames from "classnames";

export const UserPreferencesPage = () => {
  const { user } = useAuth();
  const { userPreferences, updateUserPreference } = useUserPreference();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-xl font-bold mb-2 pb-2 border-b border-primary/30">
        <GearSixIcon className="inline" /> Your Preferences
      </h1>
      {userPreferences.isSuccess ? (
        <Content
          userPreference={userPreferences.data}
          onChange={updateUserPreference.mutateAsync}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

const MINUTES_IN_WEEK = 7 * 24 * 60;
type Props = {
  userPreference: UserPreference;
  onChange: (newPreference: UserPreference) => void;
};
const Content = ({ userPreference, onChange }: Props) => {
  const [value, setValue] = useState(userPreference);

  const debouncedOnChange = useMemo(
    () =>
      debounce((val: UserPreference) => {
        if (validate(val).length) return;
        onChange(val);
      }, 1000),
    [onChange]
  );

  useEffect(() => {
    debouncedOnChange(value);
  }, [value]);

  const handleChange = <TKey extends keyof UserPreference>(
    prop: TKey,
    newVal: UserPreference[TKey]
  ) => {
    setValue((v) => ({ ...v, [prop]: newVal }));
  };

  const errors = useMemo(() => validate(value), [value]);

  const dailyPracticeHours = value.weeklyTargetMinutes / 7;
  return (
    <div className="card card-default card-sm">
      <div className="card-body">
        <div className="card-title">
          <CalendarDotsIcon className="inline" /> Weekly practice time target
        </div>
        <fieldset className="fieldset">
          <label
            className={classNames("input", {
              "input-error": errors.includes("weeklyTargetMinutes"),
            })}
          >
            <input
              type="number"
              min={0}
              max={7 * 24 * 60}
              className="w-full"
              placeholder="In minutes"
              value={value.weeklyTargetMinutes}
              onChange={(e) =>
                handleChange(
                  "weeklyTargetMinutes",
                  e.currentTarget.valueAsNumber
                )
              }
            />
            <div>Mins</div>
          </label>

          <p className="label">
            That means roughly{" "}
            {isNaN(dailyPracticeHours) ? "n.a." : dailyPracticeHours.toFixed(0)}{" "}
            minutes per day
          </p>
        </fieldset>
      </div>
    </div>
  );
};

const validate = (pref: UserPreference): (keyof UserPreference)[] => {
  if (
    pref.weeklyTargetMinutes < 0 ||
    pref.weeklyTargetMinutes > MINUTES_IN_WEEK ||
    isNaN(pref.weeklyTargetMinutes)
  )
    return ["weeklyTargetMinutes"];

  return [];
};
