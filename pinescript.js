// This Pine Script™ code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © sanjaybhavsar9105

//@version=5




indicator(title='Buy/Sell by Tejaswini', overlay=true)

source = input(defval=close, title='Source')

quickEMA = ta.ema(close, 9)
plot(series=quickEMA, color=color.new(color.green, 0), linewidth=1)
per1 = input.int(defval=27, minval=1, title='Fast period')
mult1 = input.float(defval=1.6, minval=0.1, title='Fast range')
per2 = input.int(defval=55, minval=1, title='Slow period')
mult2 = input.float(defval=2, minval=0.1, title='Slow range')
smoothrng(x, t, m) =>
    wper = t * 2 - 1
    avrng = ta.ema(math.abs(x - x[1]), t)
    smoothrng = ta.ema(avrng, wper) * m
    smoothrng
smrng1 = smoothrng(source, per1, mult1)
smrng2 = smoothrng(source, per2, mult2)
smrng = (smrng1 + smrng2) / 2
rngfilt(x, r) =>
    rngfilt = x
    rngfilt := x > nz(rngfilt[1]) ? x - r < nz(rngfilt[1]) ? nz(rngfilt[1]) : x - r : x + r > nz(rngfilt[1]) ? nz(rngfilt[1]) : x + r
    rngfilt
filt = rngfilt(source, smrng)
upward = 0.0
upward := filt > filt[1] ? nz(upward[1]) + 1 : filt < filt[1] ? 0 : nz(upward[1])
downward = 0.0
downward := filt < filt[1] ? nz(downward[1]) + 1 : filt > filt[1] ? 0 : nz(downward[1])
hband = filt + smrng
lband = filt - smrng
longCond = bool(na)
shortCond = bool(na)
longCond := source > filt and source > source[1] and upward > 0 or source > filt and source < source[1] and upward > 0
shortCond := source < filt and source < source[1] and downward > 0 or source < filt and source > source[1] and downward > 0
CondIni = 0
CondIni := longCond ? 1 : shortCond ? -1 : CondIni[1]
long = longCond and CondIni[1] == -1
short = shortCond and CondIni[1] == 1
plotshape(long, title='BUY', text='BUY', style=shape.labelup, textcolor=color.new(color.white, 0), size=size.auto, location=location.belowbar, color=color.new(color.green, 0))
plotshape(short, title='SELL', text='SELL', style=shape.labeldown, textcolor=color.new(color.white, 0), size=size.auto, location=location.abovebar, color=color.new(color.red, 0))
alertcondition(long, title='BUY', message='BUY')
alertcondition(short, title='SELL', message='SELL')
anchor = input(defval='Session', title='Anchor Period')
MILLIS_IN_DAY = 86400000
dwmBarTime = timeframe.isdwm ? time : time('D')
if na(dwmBarTime)
    dwmBarTime := nz(dwmBarTime[1])
    dwmBarTime
var periodStart = time - time  // zero
makeMondayZero(dayOfWeek) =>
    (dayOfWeek + 5) % 7
isMidnight(t) =>
    hour(t) == 0 and minute(t) == 0
isSameDay(t1, t2) =>
    dayofmonth(t1) == dayofmonth(t2) and month(t1) == month(t2) and year(t1) == year(t2)
isOvernight() =>
    not(isMidnight(dwmBarTime) or request.security(syminfo.tickerid, 'D', isSameDay(time, time_close), lookahead=barmerge.lookahead_on))
tradingDayStart(t) =>
    y = year(t)
    m = month(t)
    d = dayofmonth(t)
    timestamp(y, m, d, 0, 0)
numDaysBetween(time1, time2) =>
    y1 = year(time1)
    m1 = month(time1)
    d1 = dayofmonth(time1)
    y2 = year(time2)
    m2 = month(time2)
    d2 = dayofmonth(time2)
    diff = math.abs(timestamp('GMT', y1, m1, d1, 0, 0) - timestamp('GMT', y2, m2, d2, 0, 0))
    diff / MILLIS_IN_DAY
tradingDay = isOvernight() ? tradingDayStart(dwmBarTime + MILLIS_IN_DAY) : tradingDayStart(dwmBarTime)
isNewPeriod() =>
    isNew = false
    if tradingDay != nz(tradingDay[1])
        if anchor == 'Session'
            isNew := na(tradingDay[1]) or tradingDay > tradingDay[1]
            isNew
        if anchor == 'Week'
            DAYS_IN_WEEK = 7
            isNew := makeMondayZero(dayofweek(periodStart)) + numDaysBetween(periodStart, tradingDay) >= DAYS_IN_WEEK
            isNew
        if anchor == 'Month'
            isNew := month(periodStart) != month(tradingDay) or year(periodStart) != year(tradingDay)
            isNew
        if anchor == 'Year'
            isNew := year(periodStart) != year(tradingDay)
            isNew
    isNew
src = hlc3
sumSrc = float(na)
sumVol = float(na)
sumSrc := nz(sumSrc[1], 0)
sumVol := nz(sumVol[1], 0)
if isNewPeriod()
    periodStart := tradingDay
    sumSrc := 0.0
    sumVol := 0.0
    sumVol
GLlabel = label.new(x=bar_index, y=close, text='  \n\n\n\n\n\n      ' + 'Prakash\n\n  ' + '    EEE', style=label.style_label_up, color=color.new(color.aqua, transp=100), textcolor=color.new(color.aqua, transp=30), size=size.normal)
label.delete(GLlabel[1])
if not na(src) and not na(volume)
    sumSrc += src * volume
    sumVol += volume
    sumVol
vwapValue = sumSrc / sumVol
plot(vwapValue, title='VWAP', color=color.new(color.red, 0), linewidth=3)

//EOS
