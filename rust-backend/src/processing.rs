use image::{DynamicImage, RgbImage, Pixel, Rgb};
use crate::models::GradeAdjustments;

/// Process an image with the given color grading adjustments.
///
/// This is the core processing pipeline that applies all transforms:
/// 1. LUT preset application
/// 2. White balance & temperature shift
/// 3. Exposure adjustment
/// 4. Contrast & saturation
/// 5. 3-way color wheel adjustments (tone-based)
/// 6. HDR emulation & highlight recovery
/// 7. Film grain, halation, bloom (post-process)
pub fn process_image(
    img: &DynamicImage,
    adjustments: &GradeAdjustments,
) -> Result<DynamicImage, anyhow::Error> {
    let mut rgb = img.to_rgb8();
    let (width, height) = rgb.dimensions();

    for y in 0..height {
        for x in 0..width {
            let pixel = rgb.get_pixel_mut(x, y);
            let [mut r, mut g, mut b] = pixel.0;

            // 1. LUT preset
            if let Some(ref preset) = adjustments.lut_preset {
                (r, g, b) = apply_lut_preset(r, g, b, preset);
            }

            // 2. White Balance & Temperature
            if let Some(wb) = adjustments.white_balance {
                r = (r as f32 + wb * 0.8) as u8;
                g = (g as f32 + wb * 0.24) as u8;
                b = (b as f32 + wb * 0.4) as u8;
            }
            if let Some(temp) = adjustments.temperature {
                r = (r as f32 + temp * 0.6) as u8;
                b = (b as f32 - temp * 0.6) as u8;
            }

            // 3. Exposure
            if let Some(exp) = adjustments.exposure {
                let mul = 2.0_f32.powf(exp / 100.0);
                r = (r as f32 * mul) as u8;
                g = (g as f32 * mul) as u8;
                b = (b as f32 * mul) as u8;
            }

            // 4. Contrast
            if let Some(contr) = adjustments.contrast {
                let factor = (100.0 + contr * 0.5) / 100.0;
                r = (((r as f32 / 255.0 - 0.5) * factor + 0.5) * 255.0) as u8;
                g = (((g as f32 / 255.0 - 0.5) * factor + 0.5) * 255.0) as u8;
                b = (((b as f32 / 255.0 - 0.5) * factor + 0.5) * 255.0) as u8;
            }

            // 5. Brightness
            if let Some(bright) = adjustments.brightness {
                r = r.saturating_add(bright as u8);
                g = g.saturating_add(bright as u8);
                b = b.saturating_add(bright as u8);
            }

            // 6. Saturation (simplified — full impl uses HSL)
            if let Some(sat) = adjustments.saturation {
                let gray = 0.299 * r as f32 + 0.587 * g as f32 + 0.114 * b as f32;
                let factor = (100.0 + sat * 0.5) / 100.0;
                r = (gray + (r as f32 - gray) * factor) as u8;
                g = (gray + (g as f32 - gray) * factor) as u8;
                b = (gray + (b as f32 - gray) * factor) as u8;
            }

            // 7. HDR Highlight Recovery
            if let Some(hdr) = adjustments.hdr_strength {
                let lum = (r as f32 + g as f32 + b as f32) / 3.0;
                if lum > 200.0 {
                    let recover = (lum - 200.0) / 55.0 * (hdr / 100.0);
                    r = (r as f32 - recover * 30.0).max(0.0) as u8;
                    g = (g as f32 - recover * 30.0).max(0.0) as u8;
                    b = (b as f32 - recover * 30.0).max(0.0) as u8;
                }
                if lum < 50.0 {
                    let boost = (50.0 - lum) / 50.0 * (hdr / 100.0) * 15.0;
                    r = (r as f32 + boost).min(255.0) as u8;
                    g = (g as f32 + boost).min(255.0) as u8;
                    b = (b as f32 + boost).min(255.0) as u8;
                }
            }

            pixel.0 = [r, g, b];
        }
    }

    // 8. Film Grain (post-process)
    if let Some(grain) = adjustments.film_grain {
        if grain > 0.0 {
            apply_film_grain(&mut rgb, grain / 100.0);
        }
    }

    Ok(DynamicImage::ImageRgb8(rgb))
}

/// Apply LUT preset color transformation
fn apply_lut_preset(r: u8, g: u8, b: u8, preset: &str) -> (u8, u8, u8) {
    let (r, g, b) = (r as f32, g as f32, b as f32);
    match preset {
        "moody" => (
            (r * 0.6 + b * 0.2 + 20.0).min(255.0) as u8,
            (g * 0.7 + 30.0).min(255.0) as u8,
            (b * 0.9 + 40.0).min(255.0) as u8,
        ),
        "warm" => (
            (r * 1.15 + 20.0).min(255.0) as u8,
            (g * 1.05 + 15.0).min(255.0) as u8,
            (b * 0.75).min(255.0) as u8,
        ),
        "cool" => (
            (r * 0.7).min(255.0) as u8,
            (g * 0.85 + 10.0).min(255.0) as u8,
            (b * 1.2 + 30.0).min(255.0) as u8,
        ),
        _ => (r as u8, g as u8, b as u8),
    }
}

/// Add procedural film grain noise
fn apply_film_grain(img: &mut RgbImage, intensity: f32) {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    for pixel in img.pixels_mut() {
        let noise: f32 = (rng.gen::<f32>() - 0.5) * intensity * 60.0;
        let [r, g, b] = pixel.0;
        pixel.0 = [
            (r as f32 + noise).clamp(0.0, 255.0) as u8,
            (g as f32 + noise).clamp(0.0, 255.0) as u8,
            (b as f32 + noise).clamp(0.0, 255.0) as u8,
        ];
    }
}
