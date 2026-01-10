import * as React from "react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import dayjs from "dayjs";
import { toast } from "sonner";
import { temporalEngine, type TemporalRules } from "@/lib/temporal-engine";
import { createTheme, ThemeProvider } from '@mui/material/styles';

/**
 * Custom dark theme for MUI Catalog
 */
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00FFFF', // Cyan
    },
    background: {
      paper: 'transparent',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: '#fff',
          borderRadius: '50%',
          borderWidth: '0px',
          borderColor: '#00FFFF',
          border: '0px solid',
          backgroundColor: 'transparent',
          '&.Mui-selected': {
            backgroundColor: '#00FFFF',
            color: '#000',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#00FFFF',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&.Mui-disabled': {
            color: 'rgba(255, 255, 255, 0.2)',
          }
        },
        today: {
             borderColor: '#00FFFF',
             border: '1px solid #00FFFF',
        }
      },
    },
    MuiDayCalendar: {
      styleOverrides: {
        weekDayLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: 'bold',
        }
      }
    },
    MuiPickersCalendarHeader: {
        styleOverrides: {
            switchViewButton: {
                color: 'white'
             },
             label: {
                color: 'white',
                fontWeight: 'bold'
             }
        }
    },
    MuiSvgIcon: {
        styleOverrides: {
             root: {
                color: 'rgba(255,255,255,0.7)'
             }
        }
    }
  },
});

export type CalendarProps = {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  temporalConstraints?: TemporalRules;
  className?: string;
  // Shim for DayPicker props that might be passed
  mode?: "single" | "range" | "multiple";
  showOutsideDays?: boolean;
  classNames?: any; // Ignore
};

function Calendar({
  selected,
  onSelect,
  temporalConstraints,
  className,
}: CalendarProps) {
  
  const value = React.useMemo(() => selected ? dayjs(selected) : null, [selected]);
  
  const handleChange = (newValue: dayjs.Dayjs | null) => {
      // Validate first? DateCalendar handles disabled dates but we can add extra check
      if (newValue && temporalConstraints) {
        // Double check validation if needed, but MUI disable logic should prevent selection
         const { isValid, error } = temporalEngine.validateDate(newValue.toDate(), temporalConstraints);
         if (!isValid) {
            toast.error(error || "Invalid date");
            return;
         }
      }
      onSelect?.(newValue ? newValue.toDate() : undefined);
  };

  const { minDate, maxDate, disablePast } = React.useMemo(() => {
     let min = undefined;
     let max = undefined;
     let disablePast = false;

     if (temporalConstraints) {
         if (temporalConstraints.minDate) min = dayjs(temporalConstraints.minDate);
         if (temporalConstraints.maxDate) max = dayjs(temporalConstraints.maxDate);
         if (temporalConstraints.blockPastDate) disablePast = true;
     }

     return { minDate: min, maxDate: max, disablePast };
  }, [temporalConstraints]);

  // Use a ref to attach classnames if possible, but easier to wrap
  return (
    <div className={className}>
        <ThemeProvider theme={darkTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar 
                value={value}
                onChange={handleChange}
                minDate={minDate}
                maxDate={maxDate}
                disablePast={disablePast}
                showDaysOutsideCurrentMonth
                views={['year', 'month', 'day']}
                sx={{
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'rgba(24, 24, 27, 0.95)', // zinc-900/95
                    backdropFilter: 'blur(24px)',
                    borderRadius: '32px', // Squircle-ish
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    padding: '16px',
                    '& .MuiPickersCalendarHeader-root': {
                        marginTop: '4px',
                        marginBottom: '16px',
                    },
                     '& .MuiPickersYear-yearButton': {
                        color: 'white',
                        '&.Mui-selected': {
                            backgroundColor: '#00FFFF',
                            color: 'black'
                        }
                     }
                }}
            />
            </LocalizationProvider>
        </ThemeProvider>
    </div>
  );
}

export { Calendar };
