export async function getShiprocketToken() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials are not configured.');
  }

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to authenticate with Shiprocket: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.token;
}

export async function pushOrderToShiprocket(orderDetails: any) {
  const token = await getShiprocketToken();

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderDetails),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create order in Shiprocket: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

export async function calculateShipping(pincode: string, weight: number = 0.5) {
  try {
    const token = await getShiprocketToken();
    const pickupPostcode = '110030'; // fallback pickup postcode
    const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPostcode}&delivery_postcode=${pincode}&weight=${weight}&cod=0`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) return 50; // fallback

    const data = await response.json();
    if (data.status === 200 && data.data && data.data.available_courier_companies && data.data.available_courier_companies.length > 0) {
      const lowestRate = data.data.available_courier_companies.reduce((min: any, courier: any) => courier.rate < min.rate ? courier : min, data.data.available_courier_companies[0]);
      return Math.round(lowestRate.rate);
    }
  } catch (error) {
    console.error("Error calculating shipping:", error);
  }
  return 50; // fallback
}
