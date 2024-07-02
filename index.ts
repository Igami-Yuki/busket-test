type BusSize = '大型' | '中型' | 'マイクロ' | 'ハイエース';

interface TransportBureauRates {
    distanceRate: number;
    timeRate: number;
    replacementDriverRate: number;
    nightRateIncrease: number;
}

const transportBureauRates: Record<string, TransportBureauRates> = {
    "北海道運輸局": { distanceRate: 140, timeRate: 5570, replacementDriverRate: 1890, nightRateIncrease: 1.2 }
};

interface CalculationInput {
    totalDistance: number;
    departureTime: Date;
    returnTime: Date;
    busSize: BusSize;
    busCount: number;
    departureBureau: string;
}

function calculateFare(input: CalculationInput) {
    const { totalDistance, departureTime, returnTime, busSize, busCount, departureBureau } = input;
    const rates = transportBureauRates[departureBureau];

    if (!rates) {
        throw new Error('Invalid departure bureau');
    }

    const distanceFare = calculateDistanceFare(totalDistance, rates.distanceRate);
    const totalHours = (returnTime.getTime() - departureTime.getTime()) / 3600000;
    const timeFare = calculateTimeFare(totalHours, rates.timeRate);
    const replacementDriverFare = calculateReplacementDriverFare(totalDistance, totalHours, rates.replacementDriverRate);
    const nightFare = calculateNightFare(departureTime, returnTime, rates.timeRate, rates.nightRateIncrease);

    const totalFare = distanceFare + timeFare + replacementDriverFare + nightFare;

    return {
        "キロ制運賃": distanceFare,
        "時間制運賃": timeFare,
        "交替運転者配置料金": replacementDriverFare,
        "深夜早朝料金": nightFare,
        "運賃料金の合計価格": totalFare * busCount,
    };
}

function calculateDistanceFare(distance: number, rate: number): number {
    const roundedDistance = Math.ceil(Math.max(distance, 10) / 10) * 10;
    return roundedDistance * rate;
}

function calculateTimeFare(hours: number, rate: number): number {
    const roundedHours = Math.ceil(hours);
    return roundedHours * rate;
}

function calculateReplacementDriverFare(distance: number, hours: number, rate: number): number {
    if (hours > 16 || distance > 500) {
        const roundedDistance = Math.ceil(Math.max(distance, 10) / 10) * 10;
        const roundedHours = Math.ceil(hours);
        return roundedDistance * rate + roundedHours * rate;
    }
    return 0;
}

function calculateNightFare(departureTime: Date, returnTime: Date, rate: number, increase: number): number {
    const departureHours = getNightHours(departureTime);
    const returnHours = getNightHours(returnTime);
    const nightHours = departureHours + returnHours;
    return Math.ceil(nightHours) * rate * increase;
}

function getNightHours(time: Date): number {
    const hour = time.getHours();
    if (hour >= 22 || hour < 5) {
        const endHour = hour >= 22 ? 24 : 5;
        return endHour - hour;
    }
    return 0;
}


// 使用例
const input: CalculationInput = {
    totalDistance: 230,
    departureTime: new Date('2024-07-01T01:00:00'),
    returnTime: new Date('2024-07-02T10:00:00'),
    busSize: '大型',
    busCount: 2,
    departureBureau: '北海道運輸局',
};

const output = calculateFare(input);
console.log(output);
