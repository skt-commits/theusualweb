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
