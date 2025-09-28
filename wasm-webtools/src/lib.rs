use wasm_bindgen::prelude::*;
use rand::Rng;

#[wasm_bindgen]
pub fn generate_password(length: usize, ascii_flags: &[u8]) -> String {
    if ascii_flags.len() != 128 {
        return String::from("");
    }

    let mut charset: Vec<char> = Vec::new();
    for (i, flag) in ascii_flags.iter().enumerate() {
        if *flag == 1 {
            if let Some(c) = char::from_u32(i as u32) {
                charset.push(c);
            }
        }
    }

    if charset.is_empty() {
        return String::from("");
    }

    let mut rng = rand::rng();
    (0..length)
        .map(|_| {
            let idx = rng.random_range(0..charset.len());
            charset[idx]
        })
        .collect()
}
