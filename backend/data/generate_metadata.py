import json
from pathlib import Path

# ==============================================================================
# machines.json Data
# ==============================================================================

machines = {
    "vinyl_cutter": {
        "name": "Vinyl Cutter",
        "lab": "prototyping_lab",
        "category": "digital_fabrication",
        "skills_required": ["2D Vector Graphics (SVG/DXF)"],
        "skills_taught": ["2D CNC Operations", "Adhesive Vinyl Weeding", "Transfer Techniques"],
        "related_machines": ["3d_printer"],
        "complexity_level": "beginner",
        "supervision_required": False,
        "difficulty_score": 2,
        "estimated_training_hours": 1,
        "learning_level": "novice",
        "project_categories": ["signage", "custom_decals", "stencil_making", "pcb_etching_masks"],
        "career_relevance": ["rapid_prototyping", "industrial_design", "marketing_materials"],
        "used_in_domains": ["electrical_engineering", "mechanical_engineering", "design"],
        "prerequisite_concepts": ["cartesian_coordinates", "vector_vs_raster"],
        "next_learning_steps": ["laser_cutting", "cnc_routing"],
        "required_before_using": ["basic_safety_orientation"],
        "recommended_after_learning": ["3d_printer"],
        "tags": ["2d", "cutting", "vinyl", "stickers", "decals"]
    },
    "soldering_station": {
        "name": "Soldering Station",
        "lab": "electronics_lab",
        "category": "electronics_assembly",
        "skills_required": ["basic_circuit_theory", "component_identification"],
        "skills_taught": ["through_hole_soldering", "smd_soldering", "desoldering", "flux_application"],
        "related_machines": ["infrared_ic_heater", "digital_microscope", "digital_multimeter"],
        "complexity_level": "intermediate",
        "supervision_required": True,
        "difficulty_score": 4,
        "estimated_training_hours": 3,
        "learning_level": "intermediate",
        "project_categories": ["pcb_assembly", "wire_splicing", "repair", "prototyping"],
        "career_relevance": ["electronics_technician", "hardware_engineer", "embedded_systems"],
        "used_in_domains": ["electrical_engineering", "robotics"],
        "prerequisite_concepts": ["thermal_transfer", "metallurgy_basics", "electrical_conductivity"],
        "next_learning_steps": ["reflow_soldering", "bga_rework"],
        "required_before_using": ["fume_extractor_training", "burn_safety"],
        "recommended_after_learning": ["infrared_ic_heater"],
        "tags": ["electronics", "soldering", "assembly", "heat", "pcb"]
    },
    "digital_microscope": {
        "name": "Digital Microscope",
        "lab": "inspection_lab",
        "category": "inspection",
        "skills_required": [],
        "skills_taught": ["optical_inspection", "smd_verification", "micro_soldering_prep"],
        "related_machines": ["soldering_station", "infrared_ic_heater"],
        "complexity_level": "beginner",
        "supervision_required": False,
        "difficulty_score": 1,
        "estimated_training_hours": 0.5,
        "learning_level": "novice",
        "project_categories": ["quality_control", "reverse_engineering", "pcb_inspection"],
        "career_relevance": ["quality_assurance", "failure_analysis"],
        "used_in_domains": ["electronics", "materials_science"],
        "prerequisite_concepts": ["optics_basics", "focus_depth_of_field"],
        "next_learning_steps": ["electron_microscopy"],
        "required_before_using": [],
        "recommended_after_learning": ["soldering_station"],
        "tags": ["inspection", "optics", "microscope", "camera", "quality_control"]
    },
    "3d_printer": {
        "name": "3D Printer",
        "lab": "prototyping_lab",
        "category": "additive_manufacturing",
        "skills_required": ["3D CAD", "STL File Generation"],
        "skills_taught": ["slicing", "gcode_generation", "fdm_mechanics", "bed_leveling"],
        "related_machines": ["3d_scanner", "vinyl_cutter"],
        "complexity_level": "intermediate",
        "supervision_required": True,
        "difficulty_score": 5,
        "estimated_training_hours": 4,
        "learning_level": "intermediate",
        "project_categories": ["rapid_prototyping", "custom_enclosures", "mechanical_parts"],
        "career_relevance": ["mechanical_engineering", "industrial_design", "manufacturing"],
        "used_in_domains": ["mechanical", "robotics", "design"],
        "prerequisite_concepts": ["cartesian_coordinates", "thermal_expansion", "layer_adhesion"],
        "next_learning_steps": ["sla_printing", "sls_printing", "cnc_machining"],
        "required_before_using": ["cad_basics", "slicer_software_training"],
        "recommended_after_learning": ["3d_scanner"],
        "tags": ["3d_printing", "fdm", "prototyping", "additive", "plastic"]
    },
    "3d_scanner": {
        "name": "3D Scanner",
        "lab": "prototyping_lab",
        "category": "inspection_and_reverse_engineering",
        "skills_required": ["basic_geometry"],
        "skills_taught": ["point_cloud_processing", "mesh_generation", "photogrammetry_basics"],
        "related_machines": ["3d_printer"],
        "complexity_level": "intermediate",
        "supervision_required": False,
        "difficulty_score": 4,
        "estimated_training_hours": 2,
        "learning_level": "intermediate",
        "project_categories": ["reverse_engineering", "digital_archiving", "quality_control"],
        "career_relevance": ["reverse_engineering", "quality_assurance", "metrology"],
        "used_in_domains": ["mechanical", "design", "archaeology"],
        "prerequisite_concepts": ["point_clouds", "meshes", "optical_sensors"],
        "next_learning_steps": ["advanced_mesh_repair", "cad_reconstruction"],
        "required_before_using": [],
        "recommended_after_learning": ["3d_printer"],
        "tags": ["scanning", "3d", "point_cloud", "reverse_engineering"]
    },
    "digital_weighing_scale": {
        "name": "Digital Weighing Scale",
        "lab": "materials_lab",
        "category": "measurement",
        "skills_required": [],
        "skills_taught": ["precision_measurement", "tare_function", "calibration_checks"],
        "related_machines": ["3d_printer"],
        "complexity_level": "beginner",
        "supervision_required": False,
        "difficulty_score": 1,
        "estimated_training_hours": 0.25,
        "learning_level": "novice",
        "project_categories": ["chemical_mixing", "part_mass_verification", "filament_weighing"],
        "career_relevance": ["lab_technician", "quality_control"],
        "used_in_domains": ["chemistry", "materials_science", "manufacturing"],
        "prerequisite_concepts": ["mass_vs_weight", "significant_figures"],
        "next_learning_steps": ["analytical_balances"],
        "required_before_using": [],
        "recommended_after_learning": [],
        "tags": ["measurement", "mass", "scale", "precision"]
    },
    "digital_multimeter": {
        "name": "Digital Multimeter",
        "lab": "electronics_lab",
        "category": "test_and_measurement",
        "skills_required": ["ohms_law"],
        "skills_taught": ["voltage_measurement", "current_measurement", "resistance", "continuity", "diode_testing"],
        "related_machines": ["variable_power_supply", "oscilloscope", "function_generator"],
        "complexity_level": "beginner",
        "supervision_required": False,
        "difficulty_score": 2,
        "estimated_training_hours": 1,
        "learning_level": "novice",
        "project_categories": ["circuit_debugging", "component_testing", "power_verification"],
        "career_relevance": ["electrical_engineering", "electronics_technician", "hardware_testing"],
        "used_in_domains": ["electrical", "robotics", "automotive"],
        "prerequisite_concepts": ["voltage", "current", "resistance", "series_parallel_circuits"],
        "next_learning_steps": ["oscilloscope"],
        "required_before_using": ["basic_electrical_safety"],
        "recommended_after_learning": ["variable_power_supply"],
        "tags": ["dmm", "multimeter", "voltage", "current", "resistance", "testing"]
    },
    "variable_power_supply": {
        "name": "Variable Power Supply",
        "lab": "electronics_lab",
        "category": "power",
        "skills_required": ["ohms_law", "voltage_current_limits"],
        "skills_taught": ["constant_voltage_mode", "constant_current_mode", "power_sequencing"],
        "related_machines": ["digital_multimeter", "oscilloscope", "battery_charger"],
        "complexity_level": "beginner",
        "supervision_required": False,
        "difficulty_score": 2,
        "estimated_training_hours": 1,
        "learning_level": "novice",
        "project_categories": ["circuit_prototyping", "motor_testing", "component_characterization"],
        "career_relevance": ["hardware_engineering", "test_engineering"],
        "used_in_domains": ["electrical", "robotics", "embedded_systems"],
        "prerequisite_concepts": ["power_calculations", "short_circuits", "current_limiting"],
        "next_learning_steps": ["function_generator"],
        "required_before_using": ["electrical_safety", "digital_multimeter"],
        "recommended_after_learning": ["oscilloscope"],
        "tags": ["power", "voltage", "current", "supply", "cc", "cv"]
    },
    "oscilloscope": {
        "name": "4-Channel Oscilloscope",
        "lab": "electronics_lab",
        "category": "test_and_measurement",
        "skills_required": ["ac_dc_theory", "waveform_basics"],
        "skills_taught": ["signal_visualization", "triggering", "frequency_measurement", "noise_analysis"],
        "related_machines": ["function_generator", "variable_power_supply", "digital_multimeter"],
        "complexity_level": "advanced",
        "supervision_required": True,
        "difficulty_score": 7,
        "estimated_training_hours": 5,
        "learning_level": "advanced",
        "project_categories": ["signal_integrity", "clock_debugging", "pwm_analysis", "filter_characterization"],
        "career_relevance": ["hardware_engineer", "rf_engineer", "embedded_systems_engineer"],
        "used_in_domains": ["electrical", "telecommunications", "embedded"],
        "prerequisite_concepts": ["time_domain", "frequency", "amplitude", "sampling_rate"],
        "next_learning_steps": ["spectrum_analyzer", "logic_analyzer"],
        "required_before_using": ["digital_multimeter", "variable_power_supply"],
        "recommended_after_learning": ["function_generator"],
        "tags": ["scope", "oscilloscope", "waveform", "signals", "ac", "frequency"]
    },
    "function_generator": {
        "name": "Function Generator",
        "lab": "electronics_lab",
        "category": "test_and_measurement",
        "skills_required": ["waveform_theory"],
        "skills_taught": ["signal_injection", "frequency_sweeps", "modulation_basics", "impedance_matching"],
        "related_machines": ["oscilloscope", "digital_multimeter"],
        "complexity_level": "intermediate",
        "supervision_required": False,
        "difficulty_score": 5,
        "estimated_training_hours": 2,
        "learning_level": "intermediate",
        "project_categories": ["filter_testing", "amplifier_characterization", "clock_simulation"],
        "career_relevance": ["test_engineer", "rf_engineer", "audio_engineer"],
        "used_in_domains": ["electrical", "audio", "telecom"],
        "prerequisite_concepts": ["waveforms", "frequency", "amplitude", "offset", "duty_cycle"],
        "next_learning_steps": ["arbitrary_waveform_generation", "rf_signal_generation"],
        "required_before_using": ["oscilloscope"],
        "recommended_after_learning": ["digital_lcr_meter"],
        "tags": ["generator", "signal", "waveform", "sine", "square", "pwm"]
    },
    "coil_winding_machine": {
        "name": "Motorized Coil Winding Machine",
        "lab": "electromechanics_lab",
        "category": "manufacturing",
        "skills_required": ["basic_electromagnetism"],
        "skills_taught": ["wire_tensioning", "turn_counting", "spooling", "custom_inductor_creation"],
        "related_machines": ["digital_lcr_meter", "soldering_station"],
        "complexity_level": "intermediate",
        "supervision_required": True,
        "difficulty_score": 4,
        "estimated_training_hours": 2,
        "learning_level": "intermediate",
        "project_categories": ["custom_transformers", "motor_rewinding", "rf_inductors", "electromagnets"],
        "career_relevance": ["motor_design", "power_electronics", "rf_engineering"],
        "used_in_domains": ["electrical", "power", "rf"],
        "prerequisite_concepts": ["inductance", "magnetic_flux", "wire_gauge_awg"],
        "next_learning_steps": ["cnc_winding"],
        "required_before_using": ["pinch_hazard_safety"],
        "recommended_after_learning": ["digital_lcr_meter"],
        "tags": ["winding", "coil", "inductor", "transformer", "wire", "magnetics"]
    },
    "battery_charger": {
        "name": "Battery Charger",
        "lab": "power_lab",
        "category": "power",
        "skills_required": ["battery_chemistry_basics"],
        "skills_taught": ["charge_profiles", "balancing", "capacity_testing", "internal_resistance"],
        "related_machines": ["variable_power_supply", "digital_multimeter"],
        "complexity_level": "intermediate",
        "supervision_required": True,
        "difficulty_score": 4,
        "estimated_training_hours": 2,
        "learning_level": "intermediate",
        "project_categories": ["drone_batteries", "ev_prototyping", "portable_electronics"],
        "career_relevance": ["ev_engineer", "power_systems_engineer"],
        "used_in_domains": ["robotics", "automotive", "renewable_energy"],
        "prerequisite_concepts": ["lithium_ion_safety", "c_ratings", "series_parallel_cells"],
        "next_learning_steps": ["battery_management_systems_bms"],
        "required_before_using": ["fire_safety", "lipo_handling"],
        "recommended_after_learning": [],
        "tags": ["battery", "charger", "lipo", "li-ion", "power", "bms"]
    },
    "infrared_ic_heater": {
        "name": "Infrared IC Heater",
        "lab": "electronics_lab",
        "category": "electronics_assembly",
        "skills_required": ["smd_soldering", "thermal_profiles"],
        "skills_taught": ["bga_rework", "reflow_soldering", "thermal_soaking"],
        "related_machines": ["soldering_station", "digital_microscope"],
        "complexity_level": "advanced",
        "supervision_required": True,
        "difficulty_score": 7,
        "estimated_training_hours": 4,
        "learning_level": "advanced",
        "project_categories": ["motherboard_repair", "custom_smd_pcbs", "chip_replacement"],
        "career_relevance": ["hardware_repair_technician", "manufacturing_engineer"],
        "used_in_domains": ["electronics", "manufacturing"],
        "prerequisite_concepts": ["reflow_curves", "solder_paste", "flux_chemistry"],
        "next_learning_steps": ["xray_inspection"],
        "required_before_using": ["soldering_station"],
        "recommended_after_learning": ["digital_microscope"],
        "tags": ["ir", "heater", "reflow", "bga", "smd", "rework", "soldering"]
    },
    "digital_telescope": {
        "name": "Digital Telescope",
        "lab": "optics_lab",
        "category": "observation",
        "skills_required": ["basic_astronomy"],
        "skills_taught": ["celestial_tracking", "astrophotography", "lens_calibration"],
        "related_machines": [],
        "complexity_level": "beginner",
        "supervision_required": False,
        "difficulty_score": 3,
        "estimated_training_hours": 1.5,
        "learning_level": "novice",
        "project_categories": ["astrophotography", "satellite_tracking", "optical_alignment"],
        "career_relevance": ["aerospace", "optics_engineering"],
        "used_in_domains": ["astrophysics", "optics"],
        "prerequisite_concepts": ["focal_length", "aperture", "equatorial_mounts"],
        "next_learning_steps": ["radio_telescopy"],
        "required_before_using": [],
        "recommended_after_learning": [],
        "tags": ["telescope", "optics", "astronomy", "lens", "space"]
    },
    "digital_lcr_meter": {
        "name": "Digital LCR Meter",
        "lab": "electronics_lab",
        "category": "test_and_measurement",
        "skills_required": ["ac_theory", "impedance"],
        "skills_taught": ["inductance_measurement", "capacitance_measurement", "esr_testing", "q_factor"],
        "related_machines": ["coil_winding_machine", "function_generator", "digital_multimeter"],
        "complexity_level": "intermediate",
        "supervision_required": False,
        "difficulty_score": 5,
        "estimated_training_hours": 2,
        "learning_level": "intermediate",
        "project_categories": ["filter_design", "custom_inductor_verification", "capacitor_health_check"],
        "career_relevance": ["power_electronics", "rf_engineer", "component_engineer"],
        "used_in_domains": ["electrical", "rf", "power"],
        "prerequisite_concepts": ["reactance", "impedance", "parasitic_components"],
        "next_learning_steps": ["vector_network_analyzer_vna"],
        "required_before_using": ["digital_multimeter"],
        "recommended_after_learning": ["function_generator"],
        "tags": ["lcr", "inductance", "capacitance", "resistance", "impedance", "esr"]
    }
}

# ==============================================================================
# machine_content.json Data
# ==============================================================================

# Helper to generate generic content structure for each machine
def generate_content(m_id, m_info):
    m_name = m_info["name"]
    return {
        "description": f"The {m_name} is a core piece of lab equipment used for educational and prototyping purposes.",
        "overview": f"This tool allows students to interact with fundamental principles of engineering. It is heavily utilized in the {m_info['lab']}.",
        "working_principle": "Operates on standard engineering principles specific to its domain. Converts inputs into measured or fabricated outputs.",
        "historical_background": f"Early versions of the {m_name} revolutionized engineering workflows.",
        "specs": {
            "power": "110/220V AC",
            "accuracy": "Educational Grade",
            "interface": "Digital/Analog"
        },
        "applications": m_info["project_categories"],
        "industries": m_info["career_relevance"],
        "advantages": ["Accessible for beginners", "Safe for educational use", "Robust design"],
        "limitations": ["Not industrial grade", "Requires training", "Calibration drift over time"],
        "real_world_products": ["Consumer electronics", "Prototyped parts", "Automotive components"],
        "interesting_facts": ["Often the first machine students learn in their respective domains."],
        "safety_summary": "Always wear appropriate PPE. Follow lab protocols. Do not operate unsupervised if required.",
        "sop_summary": "Power on, initialize/calibrate, perform operation, clean up, power down.",
        "common_beginner_mistakes": ["Skipping calibration", "Ignoring safety warnings", "Using incorrect settings"],
        "maintenance_notes": "Regularly clean the workspace and verify calibration standards.",
        "calibration_notes": "Calibrate before critical measurements or high-precision fabrication.",
        "troubleshooting": [
            {"problem": "Won't power on", "cause": "Unplugged or blown fuse", "solution": "Check cables and fuses."}
        ],
        "project_examples": [
            {"name": "Introductory Lab", "difficulty": "Beginner", "description": f"A simple guided exercise to learn the {m_name}."},
            {"name": "Intermediate Project", "difficulty": "Intermediate", "description": "Applying multiple concepts together."},
            {"name": "Capstone Module", "difficulty": "Advanced", "description": "Full integration into a larger system."}
        ],
        "learning_path": {
            "before": m_info["required_before_using"],
            "current": m_info["skills_taught"],
            "next": m_info["next_learning_steps"]
        },
        "faq_topics": ["How to turn it on?", "What are the safety risks?", "How to calibrate?"],
        "keywords": m_info["tags"],
        "images": [],
        "manual_path": f"/static/docs/{m_id}/manual.pdf",
        "sop_path": f"/static/docs/{m_id}/sop.pdf"
    }

machine_content = {m_id: generate_content(m_id, m_info) for m_id, m_info in machines.items()}

# Specific customizations to make it richer
machine_content["oscilloscope"]["project_examples"] = [
    {"name": "Signal Generator Probing", "difficulty": "Beginner", "description": "Measure sine, square, and triangle waves from a function generator."},
    {"name": "Clock Signal Integrity", "difficulty": "Intermediate", "description": "Analyze the rise time and ringing of a microcontroller clock."},
    {"name": "I2C Decoding", "difficulty": "Advanced", "description": "Use serial decoding to sniff I2C traffic between a sensor and an MCU."}
]
machine_content["3d_printer"]["project_examples"] = [
    {"name": "Calibration Cube", "difficulty": "Beginner", "description": "Print a 20mm cube to verify dimensional accuracy."},
    {"name": "Drone Frame", "difficulty": "Intermediate", "description": "Design and print a lightweight, high-infill frame for a quadcopter."},
    {"name": "Robotic Arm Gripper", "difficulty": "Advanced", "description": "Print interlocking gears and linkages for a robotic end-effector."}
]
machine_content["soldering_station"]["project_examples"] = [
    {"name": "Wire Splicing", "difficulty": "Beginner", "description": "Learn to properly splice and heat-shrink two wires."},
    {"name": "Through-Hole PCB", "difficulty": "Beginner", "description": "Solder a basic 555 timer LED blinker circuit."},
    {"name": "SMD Drag Soldering", "difficulty": "Advanced", "description": "Solder a 64-pin TQFP microcontroller using drag soldering techniques."}
]


if __name__ == "__main__":
    data_dir = Path(__file__).parent
    
    with open(data_dir / "machines.json", "w", encoding="utf-8") as f:
        json.dump(machines, f, indent=2)
        
    with open(data_dir / "machine_content.json", "w", encoding="utf-8") as f:
        json.dump(machine_content, f, indent=2)
        
    print("Successfully generated machines.json and machine_content.json")
